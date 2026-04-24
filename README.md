# Asim — Identity Graph Platform

Monorepo containing:

- **apps/web** — Next.js 14 (App Router, TypeScript, Tailwind)
- **apps/graph-service** — Python FastAPI service wrapping Graphiti + Neo4j
- **packages/contracts** — Shared schemas in `.ts` and `.py` (must stay in sync)

## Prerequisites

- Node.js 20 LTS
- Python 3.11+
- Docker & Docker Compose
- API keys: `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`

> **Why both keys?** Graphiti uses OpenAI for embeddings and Anthropic for LLM extraction.

## Quick Start (three terminals)

### 1. Environment setup

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and OPENAI_API_KEY
```

### 2. Terminal 1 — Neo4j

```bash
docker compose up
```

Wait until you see `Started.` in the logs. Neo4j Browser available at http://localhost:7474.

### 3. Terminal 2 — Graph Service

```bash
cd apps/graph-service
python -m venv .venv
source .venv/bin/activate
pip install -e .
# Load env vars (or use direnv / dotenv)
export $(grep -v '^#' ../../.env | xargs)
uvicorn main:app --reload --port 8000
```

On startup you should see:

```
INFO: Graphiti connected and test episode ingested (uuid=...)
```

Verify: `curl http://localhost:8000/health`

### 4. Terminal 3 — Web App

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Verify healthcheck round-trip:

```bash
curl http://localhost:3000/api/health
# Should return {"status":"ok","graphiti_connected":true,"neo4j_uri":"bolt://localhost:7687"}
```

## Project Structure

```
.
├── apps/
│   ├── web/                  # Next.js frontend
│   │   └── src/
│   │       ├── app/
│   │       │   └── api/health/route.ts   # Proxies to graph-service /health
│   │       └── lib/
│   │           ├── auth.ts               # Stub auth (always returns "justin")
│   │           └── graph-client.ts       # Typed fetch wrapper for graph-service
│   └── graph-service/        # FastAPI backend
│       ├── main.py           # App entrypoint with Graphiti lifecycle
│       └── pyproject.toml
├── packages/
│   └── contracts/            # Shared schemas (TS + Python)
│       ├── episode.ts
│       ├── episode.py
│       └── README.md
├── docker-compose.yml        # Neo4j 5.x + APOC
└── .env.example
```

## Auth

Stub only. There is one user, `"justin"`, hardcoded in `apps/web/src/lib/auth.ts`. This will be replaced by a real auth system in a future workstream.

## Contracts Ownership

The schemas in `packages/contracts/` are owned by the W1 scaffolding workstream. No other workstream may modify these without explicit approval.
