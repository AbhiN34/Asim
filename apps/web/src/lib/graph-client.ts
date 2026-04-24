/**
 * Typed client for the Asim graph-service API.
 */

import type {
  EpisodeInput,
  EpisodeResponse,
  HealthResponse,
} from "../../../../packages/contracts/episode";

const GRAPH_SERVICE_URL =
  process.env.NEXT_PUBLIC_GRAPH_SERVICE_URL ?? "http://localhost:8000";

class GraphClientError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "GraphClientError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${GRAPH_SERVICE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new GraphClientError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export const graphClient = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },

  createEpisode(input: EpisodeInput): Promise<EpisodeResponse> {
    return request<EpisodeResponse>("/episodes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
