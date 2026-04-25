// Thin typed client for the FastAPI / Graphiti backend.
// All functions are server-only (they reference process.env and use fetch with no-store).

const base = () => process.env.GRAPHITI_URL ?? 'http://localhost:8000'

export interface GraphNode {
  id: string
  label: string
  type: string
  summary: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface EpisodeEvidence {
  content: string
  source_description: string
}

export interface EvidenceData {
  episodes: EpisodeEvidence[]
}

export async function ingestText(
  text: string,
  groupId: string,
  sourceDescription: string,
): Promise<{ ok: boolean; name: string }> {
  let res: Response
  try {
    res = await fetch(`${base()}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, group_id: groupId, source_description: sourceDescription }),
    })
  } catch {
    throw new Error(
      `Cannot reach the graph service at ${base()}. Make sure the backend is running: cd asim-mvp && uvicorn main:app --reload`,
    )
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Graphiti ingest failed (${res.status}): ${body}`)
  }
  return res.json() as Promise<{ ok: boolean; name: string }>
}

export async function fetchGraph(groupId: string): Promise<GraphData> {
  const res = await fetch(
    `${base()}/graph?group_id=${encodeURIComponent(groupId)}`,
    { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`Graph fetch failed: ${res.status}`)
  return res.json() as Promise<GraphData>
}

export async function fetchEvidence(edgeId: string): Promise<EvidenceData> {
  const res = await fetch(
    `${base()}/graph/evidence/${encodeURIComponent(edgeId)}`,
    { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`Evidence fetch failed: ${res.status}`)
  return res.json() as Promise<EvidenceData>
}
