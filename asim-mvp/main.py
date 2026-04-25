import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from pydantic import BaseModel

from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType


USER = "justin"


class IngestBody(BaseModel):
    text: str
    group_id: str = USER
    source_description: str = "user input"


class QueryBody(BaseModel):
    question: str
    group_id: str = USER


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    app.state.graphiti = Graphiti(
        os.environ["NEO4J_URI"],
        os.environ["NEO4J_USER"],
        os.environ["NEO4J_PASSWORD"],
    )
    app.state.openai = AsyncOpenAI()
    print("Asim graph service ready on http://localhost:8000")
    yield
    await app.state.graphiti.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    try:
        async with app.state.graphiti.driver.session() as session:
            res = await session.run("RETURN 1 AS ok")
            await res.single()
        return {"ok": True, "neo4j": True}
    except Exception:
        return {"ok": False}


@app.post("/ingest")
async def ingest(body: IngestBody):
    name = f"ingest-{uuid4()}"
    try:
        await app.state.graphiti.add_episode(
            name=name,
            episode_body=body.text,
            source=EpisodeType.text,
            source_description=body.source_description,
            reference_time=datetime.now(timezone.utc),
            group_id=body.group_id,
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(e)})
    return {"ok": True, "name": name}


@app.get("/graph")
async def graph(group_id: str = Query(default=USER)):
    try:
        nodes, edges = [], []
        async with app.state.graphiti.driver.session() as session:
            res = await session.run(
                """
                MATCH (n:Entity {group_id: $gid})
                RETURN n.uuid AS id, n.name AS name, n.summary AS summary
                LIMIT 200
                """,
                gid=group_id,
            )
            async for rec in res:
                nodes.append({
                    "id": rec["id"],
                    "label": rec["name"],
                    "type": "Entity",
                    "summary": rec["summary"] or "",
                })

            res = await session.run(
                """
                MATCH (a:Entity {group_id: $gid})-[r:RELATES_TO]->(b:Entity {group_id: $gid})
                RETURN r.uuid AS id, r.source_node_uuid AS source,
                       r.target_node_uuid AS target, r.fact AS fact, r.name AS name
                LIMIT 500
                """,
                gid=group_id,
            )
            async for rec in res:
                edges.append({
                    "id": rec["id"],
                    "source": rec["source"],
                    "target": rec["target"],
                    "label": rec["fact"] or rec["name"] or "related",
                })
        return {"nodes": nodes, "edges": edges}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/graph/evidence/{edge_id}")
async def graph_evidence(edge_id: str):
    """
    Returns the raw source episode(s) that caused this edge to be created.
    Graphiti stores episode UUIDs on the RELATES_TO relationship under the
    `episodes` property (list of strings). Adjust the property name below if
    your graphiti-core version uses a different field (e.g. `episode_mentions`).
    """
    try:
        episodes = []
        async with app.state.graphiti.driver.session() as session:
            res = await session.run(
                """
                MATCH ()-[r:RELATES_TO {uuid: $edge_id}]->()
                WITH r
                MATCH (ep:Episodic)
                WHERE ep.uuid IN r.episodes
                RETURN ep.content AS content,
                       ep.source_description AS source_description
                LIMIT 5
                """,
                edge_id=edge_id,
            )
            async for rec in res:
                episodes.append({
                    "content": rec["content"] or "",
                    "source_description": rec["source_description"] or "",
                })
        return {"episodes": episodes}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/query")
async def query(body: QueryBody):
    try:
        results = await app.state.graphiti.search(
            body.question, group_ids=[USER], num_results=10
        )
        sources = [getattr(r, "fact", None) or getattr(r, "name", "") for r in results]
        formatted = "\n".join(f"- {s}" for s in sources if s) or "(no facts found)"
        completion = await app.state.openai.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are answering questions about Justin based on his identity graph. "
                        "Only use facts from the provided context. If the context doesn't "
                        "answer the question, say so explicitly. Be concise."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Context (facts from graph):\n{formatted}\n\nQuestion: {body.question}",
                },
            ],
        )
        answer = completion.choices[0].message.content or ""
        return {"answer": answer, "sources": sources}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


app.mount("/", StaticFiles(directory=".", html=True), name="static")
