import "server-only";

/**
 * The Google ID token this app's server sends when it calls the API on a private Cloud Run service (frontend-staging
 * calling backend-staging). On only with `API_ID_TOKEN=metadata`, which the backend's deploy/20-frontend-staging.sh
 * sets; never with MOCK=1, never in local development.
 *
 * The token comes from the metadata server of the service this app runs on (its own service account), for the
 * API_ORIGIN audience, and is held for 45 minutes (Google's last for an hour). It goes in `Authorization: Bearer` on
 * the server's own calls, beside the visitor's cookie. It is never sent to the browser, never logged and never put in
 * an error message.
 */
export const METADATA_IDENTITY_URL =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity";
export const ID_TOKEN_TTL_MS = 45 * 60_000;

type Env = Record<string, string | undefined>;

export function idTokenOn(env: Env): boolean {
  return env.API_ID_TOKEN === "metadata" && env.MOCK !== "1";
}

export interface IdTokenSourceOptions {
  /** The API's origin: Cloud Run checks the token's audience against its own address. */
  audience: string;
  fetch?: typeof fetch;
  now?: () => number;
  ttlMs?: number;
}

/** A function that returns a fresh-enough ID token: one metadata call per 45 minutes, shared by calls in flight. */
export function createIdTokenSource(options: IdTokenSourceOptions): () => Promise<string> {
  const doFetch = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const ttl = options.ttlMs ?? ID_TOKEN_TTL_MS;
  const url = `${METADATA_IDENTITY_URL}?audience=${encodeURIComponent(options.audience)}`;
  let held: { token: string; at: number } | undefined;
  let inFlight: Promise<string> | undefined;

  async function fetchToken(): Promise<string> {
    const response = await doFetch(url, { headers: { "Metadata-Flavor": "Google" }, cache: "no-store" });
    if (!response.ok) throw new Error(`the metadata server answered ${response.status} for an ID token`);
    const token = (await response.text()).trim();
    if (!token) throw new Error("the metadata server answered an empty ID token");
    held = { token, at: now() };
    return token;
  }

  return async function idToken() {
    if (held && now() - held.at < ttl) return held.token;
    inFlight ??= fetchToken().finally(() => {
      inFlight = undefined;
    });
    return inFlight;
  };
}

/**
 * The headers of one server-side API call: the visitor's own cookie (when there is one), and the service's ID token
 * when it is on. The two are separate: the token says "frontend-staging may call backend-staging", the cookie says who
 * the visitor is.
 */
export async function serverCallHeaders(opts: {
  cookie?: string | null;
  idToken?: () => Promise<string>;
}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.idToken) headers.authorization = `Bearer ${await opts.idToken()}`;
  return headers;
}
