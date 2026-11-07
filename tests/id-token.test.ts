import { describe, expect, it } from "vitest";
import { createClient } from "@/api/client";
import {
  createIdTokenSource,
  ID_TOKEN_TTL_MS,
  idTokenOn,
  METADATA_IDENTITY_URL,
  serverCallHeaders,
} from "@/api/id-token";

const AUDIENCE = "https://backend-staging-invented-uw.a.run.app";
const TOKEN = "invented.id.token";

/** A stand-in metadata server: records each call, answers a token (a new one each time) or an error. */
function metadataStub(status = 200) {
  const calls: { url: string; headers: Headers }[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, headers: new Headers(init.headers) });
    return new Response(status === 200 ? `${TOKEN}-${calls.length}\n` : "denied", { status });
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

describe("the service's ID token (API_ID_TOKEN=metadata)", () => {
  it("is on only with API_ID_TOKEN=metadata, and never with the mock", () => {
    expect(idTokenOn({ API_ID_TOKEN: "metadata" })).toBe(true);
    expect(idTokenOn({ API_ID_TOKEN: "metadata", MOCK: "1" })).toBe(false);
    expect(idTokenOn({})).toBe(false);
    expect(idTokenOn({ API_ID_TOKEN: "1" })).toBe(false);
  });

  it("asks the metadata server for the API's audience, with Metadata-Flavor: Google", async () => {
    const { fetch, calls } = metadataStub();
    const token = await createIdTokenSource({ audience: AUDIENCE, fetch })();
    expect(token).toBe(`${TOKEN}-1`);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe(`${METADATA_IDENTITY_URL}?audience=${encodeURIComponent(AUDIENCE)}`);
    expect(calls[0]!.url).toMatch(
      /^http:\/\/metadata\.google\.internal\/computeMetadata\/v1\/instance\/service-accounts\/default\/identity\?audience=/,
    );
    expect(calls[0]!.headers.get("metadata-flavor")).toBe("Google");
  });

  it("holds the token for 45 minutes, then asks again", async () => {
    let now = 1_000_000;
    const { fetch, calls } = metadataStub();
    const idToken = createIdTokenSource({ audience: AUDIENCE, fetch, now: () => now });
    expect(ID_TOKEN_TTL_MS).toBe(45 * 60_000);
    expect(await idToken()).toBe(`${TOKEN}-1`);
    now += ID_TOKEN_TTL_MS - 1;
    expect(await idToken()).toBe(`${TOKEN}-1`);
    expect(calls).toHaveLength(1);
    now += 1;
    expect(await idToken()).toBe(`${TOKEN}-2`);
    expect(calls).toHaveLength(2);
  });

  it("calls in flight share one metadata request", async () => {
    const { fetch, calls } = metadataStub();
    const idToken = createIdTokenSource({ audience: AUDIENCE, fetch });
    const tokens = await Promise.all([idToken(), idToken(), idToken()]);
    expect(new Set(tokens)).toEqual(new Set([`${TOKEN}-1`]));
    expect(calls).toHaveLength(1);
  });

  it("an error is not held, and says nothing of a token", async () => {
    const { fetch } = metadataStub(403);
    const idToken = createIdTokenSource({ audience: AUDIENCE, fetch });
    await expect(idToken()).rejects.toThrow("the metadata server answered 403 for an ID token");
    await expect(idToken()).rejects.toThrow(/403/);
  });

  it("goes in Authorization: Bearer beside the visitor's own cookie", async () => {
    const idToken = async () => TOKEN;
    expect(await serverCallHeaders({ cookie: "vg_session=invented", idToken })).toEqual({
      cookie: "vg_session=invented",
      authorization: `Bearer ${TOKEN}`,
    });
    expect(await serverCallHeaders({ idToken })).toEqual({ authorization: `Bearer ${TOKEN}` });
    expect(await serverCallHeaders({ cookie: "vg_session=invented" })).toEqual({ cookie: "vg_session=invented" });
    expect(await serverCallHeaders({ cookie: null })).toEqual({});
  });

  it("reaches the API on every server call, through the client, with the cookie", async () => {
    const meta = metadataStub();
    const idToken = createIdTokenSource({ audience: AUDIENCE, fetch: meta.fetch });
    const sent: Headers[] = [];
    const apiFetch = (async (_url: string, init: RequestInit) => {
      sent.push(new Headers(init.headers));
      return new Response(JSON.stringify({ holding: false }), { headers: { "content-type": "application/json" } });
    }) as unknown as typeof globalThis.fetch;
    const api = createClient({
      baseUrl: AUDIENCE,
      fetch: apiFetch,
      origin: AUDIENCE,
      headers: () => serverCallHeaders({ cookie: "vg_session=invented", idToken }),
    });
    await api.GET("/api/v1/site");
    await api.POST("/api/v1/auth/sign-out");
    expect(sent.map((h) => h.get("authorization"))).toEqual([`Bearer ${TOKEN}-1`, `Bearer ${TOKEN}-1`]);
    expect(sent.map((h) => h.get("cookie"))).toEqual(["vg_session=invented", "vg_session=invented"]);
    expect(meta.calls).toHaveLength(1);
  });

  it("is never in what the browser gets: only server modules import it", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const path = await import("node:path");
    const src = path.resolve(import.meta.dirname, "../src");
    const files = (readdirSync(src, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f));
    const importers = files.filter((f) =>
      /from "(\.\/|@\/api\/)id-token"/.test(readFileSync(path.join(src, f), "utf8")),
    );
    expect(importers.map((f) => f.replace(/\\/g, "/"))).toEqual(["api/server.ts"]);
    expect(readFileSync(path.join(src, "api/id-token.ts"), "utf8")).toMatch(/^import "server-only";/);
  });
});
