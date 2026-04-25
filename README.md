# Asim

A single-user identity graph. Paste any text about yourself — a paragraph, a resume blurb, survey answers — and Asim extracts entities and relationships into a Neo4j knowledge graph, then lets you visualize it and ask grounded questions about it.

This is an MVP. Single-file backend (FastAPI), single-file frontend (vanilla HTML + vis-network), no auth, hardcoded user (`justin`).

---

## Architecture

```
Browser (index.html, vis-network)
        │  fetch /ingest /graph /query
        ▼
FastAPI (main.py)         ─►  Graphiti  ─►  Neo4j (Entity / Episodic / RELATES_TO)
                          ─►  OpenAI    ─►  gpt-5-mini (extraction + RAG answers)
```

- **Graphiti** ([getzep/graphiti](https://github.com/getzep/graphiti)) extracts entities and relationships from each ingested paragraph and writes them to Neo4j with temporal validity.
- **Neo4j** stores `Entity` and `Episodic` nodes connected by `RELATES_TO` edges, all scoped to `group_id = "justin"`.
- **FastAPI** serves the four JSON endpoints and mounts `index.html` as static at `/`.
- **vis-network** renders the graph in the browser, with node size scaled by degree.
- **OpenAI** (`gpt-5-mini`) powers Graphiti's extraction/embeddings and also generates the chat answers in `/query`, grounded in retrieved facts.

---

## Prerequisites

- Python 3.11+
- Neo4j 5.x running locally (Neo4j Desktop is the simplest path)
- An OpenAI API key with access to `gpt-5-mini`

---

## Setup

```bash
cd asim-mvp
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn openai graphiti-core python-dotenv
cp .env.local .env
# now edit .env with your real Neo4j password and OpenAI key
```

`.env` (gitignored) must contain:

| Var               | Example                          | Notes                                                 |
|-------------------|----------------------------------|-------------------------------------------------------|
| `NEO4J_URI`       | `bolt://127.0.0.1:7687`          | If `neo4j://` fails to connect, try `bolt://`.        |
| `NEO4J_USER`      | `neo4j`                          | Default Neo4j Desktop user.                           |
| `NEO4J_PASSWORD`  | (your password)                  | Whatever you set when creating the Neo4j DB.          |
| `OPENAI_API_KEY`  | `sk-...`                         | Used by Graphiti and `/query`.                        |

---

## Running

**1. Smoke test Graphiti ↔ Neo4j ↔ OpenAI**

```bash
python test_graphiti.py
```

This ingests a hardcoded paragraph about Justin, runs a search, and prints the top 5 retrieved facts. Expect `SUCCESS` after 30–90 seconds (Graphiti makes multiple LLM calls per episode).

**2. Start the server**

```bash
uvicorn main:app --reload
```

Open `http://localhost:8000/`.

The page has three sections:
1. **Ingest** — paste text, wait 30–90s.
2. **Identity Graph** — vis-network rendering, click nodes for details.
3. **Ask your graph** — questions answered using only the extracted facts.

---

## API

All endpoints are scoped to `group_id = "justin"`.

| Method | Path      | Body            | Returns                                                                 |
|--------|-----------|-----------------|-------------------------------------------------------------------------|
| GET    | `/health` | —               | `{ok: bool, neo4j: bool}`                                              |
| POST   | `/ingest` | `{text}`        | `{ok, name}` — blocks for the full Graphiti pipeline (30–90s)          |
| GET    | `/graph`  | —               | `{nodes: [{id, label, type, summary}], edges: [{id, source, target, label}]}` (capped at 200 nodes / 500 edges; embeddings stripped) |
| POST   | `/query`  | `{question}`    | `{answer, sources: [str]}` — RAG over Graphiti hybrid search           |

Error responses use HTTP 500 with `{ok: false, error: "..."}` (or `{error: "..."}` for non-mutating endpoints).

---

## Project structure

```
.
├── README.md
├── .gitignore
└── asim-mvp/
    ├── main.py             FastAPI app — lifespan inits Graphiti once
    ├── index.html          Single-page UI (vis-network + vanilla JS)
    ├── test_graphiti.py    Smoke test: ingest paragraph → search → print facts
    ├── .env.local          Tracked env template — copy to .env
    ├── .env                (gitignored) real credentials
    └── .venv/              (gitignored) virtualenv
```

---

## Useful Cypher

```cypher
// Count entities and edges for justin
MATCH (n:Entity {group_id: 'justin'}) RETURN count(n);
MATCH ()-[r:RELATES_TO {group_id: 'justin'}]->() RETURN count(r);

// Inspect the schema Graphiti created
CALL db.labels();
CALL db.relationshipTypes();

// Wipe the graph (destructive — only for dev)
MATCH (n {group_id: 'justin'}) DETACH DELETE n;
```

---

## Known limitations

- Single hardcoded user (`justin`). No auth, no multi-tenant.
- `/ingest` is synchronous — the HTTP request blocks for the full LLM ingest cycle. Acceptable for a demo, not for production.
- The graph view uses degree-based sizing only — no community coloring, no filters, no temporal slicing.
- `gpt-5-mini` is hardcoded in `/query`. GPT-5 models reject `temperature`, so don't pass one.
- No tests beyond `test_graphiti.py`.
