import { describe, expect, it } from "vitest";
import { createClient } from "@/api/client";
import { createWordingsLoader } from "@/wordings/catalogue";

type Answer = { status: number; body?: unknown; etag?: string };

/** A fetch that answers from a list and records each request. */
function fakeFetch(answers: Answer[]) {
  const calls: { url: string; headers: Headers }[] = [];
  const fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, headers: new Headers(init?.headers) });
    const a = answers.shift();
    if (!a) throw new TypeError("network down");
    const headers = new Headers(a.body === undefined ? {} : { "content-type": "application/json" });
    if (a.etag) headers.set("etag", a.etag);
    return new Response(a.body === undefined ? null : JSON.stringify(a.body), { status: a.status, headers });
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

const catalogue = (version: string, entries: Record<string, string>) => ({ locale: "en", version, entries });

describe("the wordings loader", () => {
  it("fetches a namespace once, then holds it until the TTL ends", async () => {
    const { fetch, calls } = fakeFetch([{ status: 200, body: catalogue("v1", { "site.a": "A" }), etag: '"v1"' }]);
    let now = 0;
    const loader = createWordingsLoader({
      api: createClient({ baseUrl: "http://api.test", fetch }),
      ttlMs: 1000,
      now: () => now,
    });
    expect(await loader.load("en", "site")).toEqual({ "site.a": "A" });
    now = 999;
    expect(await loader.load("en", "site")).toEqual({ "site.a": "A" });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("http://api.test/api/v1/wordings?locale=en&ns=site");
    expect(loader.versionOf("en", "site")).toBe("v1");
  });

  it("re-checks with If-None-Match after the TTL and keeps what it holds on a 304", async () => {
    const { fetch, calls } = fakeFetch([
      { status: 200, body: catalogue("v1", { "site.a": "A" }), etag: '"v1"' },
      { status: 304 },
    ]);
    let now = 0;
    const loader = createWordingsLoader({
      api: createClient({ baseUrl: "http://api.test", fetch }),
      ttlMs: 10,
      now: () => now,
    });
    await loader.load("en", "site");
    now = 50;
    expect(await loader.load("en", "site")).toEqual({ "site.a": "A" });
    expect(calls[1]!.headers.get("if-none-match")).toBe('"v1"');
  });

  it('uses the version as the ETag when the header is missing or not an ETag (the mock answers "string")', async () => {
    const { fetch, calls } = fakeFetch([
      { status: 200, body: catalogue("abc", { "site.a": "A" }), etag: "string" },
      { status: 200, body: catalogue("def", { "site.a": "B" }) },
    ]);
    let now = 0;
    const loader = createWordingsLoader({
      api: createClient({ baseUrl: "http://api.test", fetch }),
      ttlMs: 10,
      now: () => now,
    });
    await loader.load("en", "site");
    now = 50;
    expect(await loader.load("en", "site")).toEqual({ "site.a": "B" });
    expect(calls[1]!.headers.get("if-none-match")).toBe('"abc"');
    expect(loader.versionOf("en", "site")).toBe("def");
  });

  it("keeps the last catalogue when the API cannot be reached, and throws when it holds none", async () => {
    const { fetch } = fakeFetch([{ status: 200, body: catalogue("v1", { "site.a": "A" }) }]);
    let now = 0;
    const loader = createWordingsLoader({
      api: createClient({ baseUrl: "http://api.test", fetch }),
      ttlMs: 10,
      now: () => now,
    });
    await loader.load("en", "site");
    now = 50;
    expect(await loader.load("en", "site")).toEqual({ "site.a": "A" });
    await expect(loader.load("en", "errors")).rejects.toThrow(/en:errors could not be loaded/);
  });

  it("throws on an error answer with nothing held", async () => {
    const { fetch } = fakeFetch([
      { status: 429, body: { error: { code: "rate_limited", message_key: "errors.rate_limited" } } },
    ]);
    const loader = createWordingsLoader({ api: createClient({ baseUrl: "http://api.test", fetch }) });
    await expect(loader.load("en", "site")).rejects.toThrow(/429 \(rate_limited\)/);
  });

  it("merges several namespaces", async () => {
    const { fetch } = fakeFetch([
      { status: 200, body: catalogue("v1", { "site.a": "A" }) },
      { status: 200, body: catalogue("v1", { "errors.b": "B" }) },
    ]);
    const loader = createWordingsLoader({ api: createClient({ baseUrl: "http://api.test", fetch }) });
    expect(await loader.loadMany("en", ["site", "errors"])).toEqual({ "site.a": "A", "errors.b": "B" });
  });

  it("with the mock, asks for the namespace's own example and falls back to the plain answer", async () => {
    const { fetch, calls } = fakeFetch([
      { status: 404, body: { error: { code: "not_found", message_key: "errors.not_found" } } },
      { status: 200, body: catalogue("v1", { "site.a": "A" }) },
    ]);
    const loader = createWordingsLoader({ api: createClient({ baseUrl: "http://127.0.0.1:4010", fetch }), mock: true });
    expect(await loader.load("en", "common")).toEqual({ "site.a": "A" });
    expect(calls[0]!.headers.get("prefer")).toBe("example=common");
    expect(calls[1]!.headers.get("prefer")).toBeNull();
  });
});
