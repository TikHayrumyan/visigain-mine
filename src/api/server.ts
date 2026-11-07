import "server-only";
import { headers } from "next/headers";
import { createClient } from "./client";
import { serverApiOrigin } from "./origin";

/**
 * The API client for a page rendering on this app's own server. It calls the backend (or the mock) directly, and
 * forwards the visitor's cookie, which no browser adds here. A POST carries SITE_ORIGIN as its Origin: the backend
 * refuses a non-GET whose Origin is not its host.
 *
 * Phase 3 (docs/api/README.md, "the signed visitor-IP header"): the visitor's address will travel in a signed header
 * from here. Its name and format are not fixed yet, so nothing is sent.
 */
export async function serverApi() {
  const incoming = await headers();
  const cookie = incoming.get("cookie");
  return createClient({
    baseUrl: serverApiOrigin(process.env),
    origin: process.env.SITE_ORIGIN || undefined,
    headers: cookie ? { cookie } : {},
  });
}

/** A client for calls that need no visitor (the wordings, the switches, the prices): no cookie forwarded. */
export function publicApi() {
  return createClient({ baseUrl: serverApiOrigin(process.env) });
}
