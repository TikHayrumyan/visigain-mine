/**
 * Where calls to the API go, decided from the environment alone (no Next import, so next.config.ts can read it).
 *
 *   MOCK=1            the Prism mock: MOCK_ORIGIN, or http://127.0.0.1:4010 (`pnpm mock`)
 *   otherwise         API_ORIGIN: the backend (in development, the staging proxy on your laptop or a local backend)
 */
export const DEFAULT_MOCK_ORIGIN = "http://127.0.0.1:4010";

type Env = Record<string, string | undefined>;

const trimSlash = (s: string) => s.replace(/\/+$/, "");

export function mockOn(env: Env): boolean {
  return env.MOCK === "1";
}

/** The origin the frontend's own server calls while rendering a page. Throws when nothing says where the API is. */
export function serverApiOrigin(env: Env): string {
  if (mockOn(env)) return trimSlash(env.MOCK_ORIGIN || DEFAULT_MOCK_ORIGIN);
  if (env.API_ORIGIN) return trimSlash(env.API_ORIGIN);
  throw new Error("API_ORIGIN is not set (or run with MOCK=1 against `pnpm mock`)");
}

/**
 * The destination of the `/api/v1/*` rewrite, or null for none. The browser stays on its own origin; in production
 * the load balancer routes `/api/*` before the request reaches this app, so there is no rewrite.
 */
export function apiRewriteTarget(env: Env): string | null {
  if (mockOn(env)) return trimSlash(env.MOCK_ORIGIN || DEFAULT_MOCK_ORIGIN);
  if (env.NODE_ENV !== "production" && env.API_ORIGIN) return trimSlash(env.API_ORIGIN);
  return null;
}
