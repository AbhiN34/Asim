"""
Asim graph-service — FastAPI app wrapping Graphiti for identity-graph operations.
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

load_dotenv()

# Import shared contracts (add packages/ to path)
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "packages", "contracts"))
from episode import EpisodeInput, EpisodeResponse, HealthResponse  # noqa: E402

from graphiti_core import Graphiti
from graphiti_core.llm_client.anthropic_client import AnthropicClient
from graphiti_core.nodes import EpisodeType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "graphiti_dev")

graphiti: Graphiti | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global graphiti

    logger.info("Connecting to Neo4j at %s ...", NEO4J_URI)

    llm_client = AnthropicClient()
    # Embedder defaults to OpenAIEmbedder (requires OPENAI_API_KEY)
    graphiti = Graphiti(
        uri=NEO4J_URI,
        user=NEO4J_USER,
        password=NEO4J_PASSWORD,
        llm_client=llm_client,
    )

    await graphiti.build_indices_and_constraints()
    logger.info("Graphiti indices built.")

    # Ingest a hardcoded test episode to verify the pipeline works
    try:
        result = await graphiti.add_episode(
            name="test-episode",
            episode_body="Justin created the Asim project to build an identity graph platform.",
            source_description="hardcoded test data",
            reference_time=datetime.now(timezone.utc),
            source=EpisodeType.text,
            group_id="test",
        )
        logger.info(
            "Graphiti connected and test episode ingested (uuid=%s)",
            result.episode.uuid,
        )
    except Exception as e:
        logger.error("Test episode ingestion failed: %s", e)
        raise

    yield

    await graphiti.close()
    logger.info("Graphiti connection closed.")


app = FastAPI(title="Asim Graph Service", lifespan=lifespan)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        graphiti_connected=graphiti is not None,
        neo4j_uri=NEO4J_URI,
    )


@app.post("/episodes", response_model=EpisodeResponse)
async def create_episode(episode: EpisodeInput):
    if graphiti is None:
        raise HTTPException(status_code=503, detail="Graphiti not initialized")

    ref_time = episode.reference_time or datetime.now(timezone.utc)

    result = await graphiti.add_episode(
        name=episode.name,
        episode_body=episode.body,
        source_description=episode.source_description,
        reference_time=ref_time,
        source=EpisodeType(episode.source.value),
        group_id=episode.group_id,
    )

    ep = result.episode
    return EpisodeResponse(
        uuid=ep.uuid,
        name=ep.name,
        group_id=ep.group_id,
        source=episode.source,
        source_description=ep.source_description,
        content=ep.content,
        created_at=ep.created_at,
        valid_at=ep.valid_at,
    )
