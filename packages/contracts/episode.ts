/**
 * Episode contract schema — shared between web app and graph-service.
 *
 * IMPORTANT: This schema must stay in sync with episode.py.
 * Any changes require explicit approval from the contracts owner (W1).
 */

/** Source format of the episode content. */
export type EpisodeType = "message" | "json" | "text";

/** Schema for creating a new episode via the API. */
export interface EpisodeInput {
  name: string;
  body: string;
  source?: EpisodeType;
  source_description?: string;
  group_id?: string;
  /** ISO 8601 datetime string. Defaults to now on the server. */
  reference_time?: string;
}

/** Schema returned after an episode is ingested. */
export interface EpisodeResponse {
  uuid: string;
  name: string;
  group_id: string;
  source: EpisodeType;
  source_description: string;
  content: string;
  /** ISO 8601 datetime string */
  created_at: string;
  /** ISO 8601 datetime string */
  valid_at: string;
}

/** Health check response from graph-service. */
export interface HealthResponse {
  status: string;
  graphiti_connected: boolean;
  neo4j_uri: string;
}
