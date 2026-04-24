/**
 * Stub auth helper.
 *
 * TODO: Replace with real auth (e.g. NextAuth, Clerk, or custom JWT)
 * once the auth workstream is ready.
 */

export interface AuthUser {
  user_id: string;
}

export function getUser(): AuthUser {
  return { user_id: "justin" };
}
