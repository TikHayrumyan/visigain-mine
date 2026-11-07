import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";

/**
 * The signed visitor-IP header (the backend's src/server/security/visitor-header.ts and docs/api/README.md, "The
 * signed visitor-IP header"). When this app's server calls the API for a visitor, the backend sees this service's
 * address, not the visitor's; so each such call says whose it is:
 *
 *   x-visigain-visitor: v=1;ip=<the visitor's IP>;ts=<unix seconds>;sig=<base64url HMAC-SHA256, no padding>
 *
 * signed with FRONTEND_FORWARD_KEY (Secret Manager, the same secret the backend reads) over the five lines
 * `v1\n<METHOD>\n<path>\n<ip>\n<ts>` (the path without the query string, exactly as sent). The backend trusts it only
 * when the signature checks and the timestamp is within 60 seconds.
 *
 * Only on this server: the key is read from process.env at the call, never from a NEXT_PUBLIC_ variable, and this
 * module is server-only, so neither the key nor its name reaches the browser (tests/client-bundle.test.ts).
 */
export const VISITOR_HEADER = "x-visigain-visitor";
/** A key shorter than this is not used, as the backend does not use one (32 random bytes, base64, are 44 characters). */
export const FORWARD_KEY_MIN_LENGTH = 32;

type Env = Record<string, string | undefined>;

/** The key, or undefined when it is unset or too short: then nothing is signed and nothing is sent. */
export function forwardKey(env: Env): string | undefined {
  const key = env.FRONTEND_FORWARD_KEY?.trim();
  return key && key.length >= FORWARD_KEY_MIN_LENGTH ? key : undefined;
}

/**
 * The visitor's address, from the request this server is answering. X-Forwarded-For is a list the client can
 * pre-fill, so its first entry is the client's own word; the entry that counts is the one appended by the nearest
 * proxy we trust, counted from the right by TRUSTED_PROXY_HOPS, exactly as the backend's clientIp reads it:
 *
 *   1 (the default): frontend-staging, straight behind Cloud Run, whose front end appends the caller's address: the
 *     last entry;
 *   2: frontend-prod behind Google's load balancer, which appends "<client>, <load balancer>": the second from the
 *     right.
 *
 * Unset, empty, zero, negative or not a number is 1, never "trust everything". No header: X-Real-IP. Not an IPv4 or
 * IPv6 address: none (the call then carries no visitor header, and the backend reads it as before).
 */
export function visitorIp(headers: Pick<Headers, "get">, env: Env): string | null {
  const hops = Math.max(1, Number(env.TRUSTED_PROXY_HOPS ?? 1) || 1);
  const parts = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ip = parts.length ? (parts[Math.max(0, parts.length - hops)] ?? null) : headers.get("x-real-ip")?.trim() || null;
  return ip && isIP(ip) ? ip : null;
}

/** The header's value for one call. */
export function signVisitorHeader(key: string, o: { method: string; path: string; ip: string; ts: number }): string {
  const text = `v1\n${o.method.toUpperCase()}\n${o.path}\n${o.ip}\n${o.ts}`;
  return `v=1;ip=${o.ip};ts=${o.ts};sig=${createHmac("sha256", key).update(text).digest("base64url")}`;
}

/**
 * A fetch that adds the signed header to every call it makes, signed for that call's own method and path, at the
 * moment it is sent. The other headers are left as they are.
 */
export function visitorFetch(
  base: typeof fetch,
  o: { key: string; ip: string; now?: () => number },
): typeof fetch {
  const now = o.now ?? Date.now;
  return ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set(VISITOR_HEADER, signVisitorHeader(o.key, { method, path: url.pathname, ip: o.ip, ts: Math.floor(now() / 1000) }));
    return base(input, { ...init, headers });
  }) as typeof fetch;
}
