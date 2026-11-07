import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/api/client";
import { forwardKey, signVisitorHeader, VISITOR_HEADER, visitorFetch, visitorIp } from "@/api/visitor";

/**
 * The signed visitor-IP header (src/api/visitor.ts; the backend's src/server/security/visitor-header.ts). Invented
 * keys; addresses from the documentation ranges (RFC 5737, RFC 3849).
 */
const KEY = "invented-forward-key-0123456789-abcdefghijklmnop";
const CLIENT = "203.0.113.7";
const LB = "198.51.100.10";
const xff = (value: string) => new Headers({ "x-forwarded-for": value });

const nextHeaders = vi.hoisted(() => ({ value: new Headers() }));
vi.mock("next/headers", () => ({ headers: async () => nextHeaders.value }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("the header's value", () => {
  it("v=1;ip=;ts=;sig= with the HMAC-SHA256 of v1, the method, the path, the ip and the ts: the backend's own test vector", () => {
    expect(signVisitorHeader("k".repeat(32), { method: "get", path: "/api/v1/site", ip: CLIENT, ts: 1762456830 })).toBe(
      "v=1;ip=203.0.113.7;ts=1762456830;sig=80V6vw4nu_7KYKb7jYixkXN48yEHSEWfAAKvUtSY3ag",
    );
  });

  it("the key: FRONTEND_FORWARD_KEY, trimmed; unset, blank or under 32 characters is none", () => {
    expect(forwardKey({ FRONTEND_FORWARD_KEY: KEY })).toBe(KEY);
    expect(forwardKey({ FRONTEND_FORWARD_KEY: ` ${KEY}\n` })).toBe(KEY);
    for (const v of [undefined, "", "   ", "short-key"])
      expect(forwardKey({ FRONTEND_FORWARD_KEY: v }), String(v)).toBeUndefined();
  });
});

describe("which address is the visitor's (TRUSTED_PROXY_HOPS, as the backend's clientIp)", () => {
  it("1, the default (frontend-staging, straight behind Cloud Run): the last entry; what the client wrote before it is ignored", () => {
    expect(visitorIp(xff(CLIENT), {})).toBe(CLIENT);
    expect(visitorIp(xff(`1.2.3.4, ${CLIENT}`), {})).toBe(CLIENT);
    expect(visitorIp(xff(`1.2.3.4, ${CLIENT}`), { TRUSTED_PROXY_HOPS: "1" })).toBe(CLIENT);
  });

  it("2 (frontend-prod behind the load balancer, which appends <client>, <load balancer>): the second from the right", () => {
    const env = { TRUSTED_PROXY_HOPS: "2" };
    expect(visitorIp(xff(`${CLIENT}, ${LB}`), env)).toBe(CLIENT);
    expect(visitorIp(xff(`1.2.3.4, 5.6.7.8, ${CLIENT}, ${LB}`), env)).toBe(CLIENT);
  });

  it("unset, zero, negative or not a number is 1, never 'trust everything'", () => {
    for (const v of ["", "0", "-3", "two"])
      expect(visitorIp(xff(`1.2.3.4, ${CLIENT}`), { TRUSTED_PROXY_HOPS: v }), v).toBe(CLIENT);
  });

  it("no X-Forwarded-For: X-Real-IP; nothing that is an address: none", () => {
    expect(visitorIp(new Headers({ "x-real-ip": CLIENT }), {})).toBe(CLIENT);
    expect(visitorIp(new Headers(), {})).toBeNull();
    expect(visitorIp(xff("unknown"), {})).toBeNull();
    expect(visitorIp(xff(`${CLIENT}, not-an-address`), {})).toBeNull();
    expect(visitorIp(xff("2001:db8::7"), {})).toBe("2001:db8::7");
  });
});

/** A stand-in fetch: records each call's URL, method and headers. */
function recorder() {
  const calls: { url: string; method: string; headers: Headers }[] = [];
  const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), method: init?.method ?? "GET", headers: new Headers(init?.headers) });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

describe("visitorFetch", () => {
  it("signs each call for its own method and path (no query string), at the moment it is sent; the other headers stay", async () => {
    const { fetch, calls } = recorder();
    const now = 1762456830_000;
    const api = createClient({
      baseUrl: "https://backend.example.test",
      headers: { cookie: "vg_session=invented" },
      fetch: visitorFetch(fetch, { key: KEY, ip: CLIENT, now: () => now }),
    });
    await api.GET("/api/v1/scans/{token}", { params: { path: { token: "abc" }, query: { locale: "en" } } });
    await api.POST("/api/v1/contact", {
      body: { name: "Dana", email: "dana@example-spa.test", message: "Hello there, a question." },
    });
    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ["GET", "https://backend.example.test/api/v1/scans/abc?locale=en"],
      ["POST", "https://backend.example.test/api/v1/contact"],
    ]);
    expect(calls[0]!.headers.get(VISITOR_HEADER)).toBe(
      signVisitorHeader(KEY, { method: "GET", path: "/api/v1/scans/abc", ip: CLIENT, ts: 1762456830 }),
    );
    expect(calls[1]!.headers.get(VISITOR_HEADER)).toBe(
      signVisitorHeader(KEY, { method: "POST", path: "/api/v1/contact", ip: CLIENT, ts: 1762456830 }),
    );
    for (const c of calls) {
      expect(c.headers.get("cookie")).toBe("vg_session=invented");
      expect(c.headers.get("accept")).toBe("application/json");
      // The key itself never travels.
      expect([...c.headers.values()].join("\n")).not.toContain(KEY);
    }
  });
});

describe("serverApi and publicApi", () => {
  async function load() {
    vi.resetModules();
    return import("@/api/server");
  }

  it("with the key: the visitor's address from the incoming request, signed, on serverApi's calls; never on publicApi's", async () => {
    vi.stubEnv("API_ORIGIN", "https://backend.example.test");
    vi.stubEnv("FRONTEND_FORWARD_KEY", KEY);
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");
    const { fetch, calls } = recorder();
    vi.stubGlobal("fetch", fetch);
    nextHeaders.value = new Headers({ "x-forwarded-for": `1.2.3.4, ${CLIENT}, ${LB}`, cookie: "vg_session=invented" });
    const { publicApi, serverApi } = await load();
    await (await serverApi()).GET("/api/v1/session");
    await publicApi().GET("/api/v1/site");
    expect(calls[0]!.headers.get(VISITOR_HEADER)).toMatch(
      new RegExp(`^v=1;ip=${CLIENT.replace(/\./g, "\\.")};ts=\\d+;sig=[A-Za-z0-9_-]{43}$`),
    );
    expect(calls[1]!.headers.get(VISITOR_HEADER)).toBeNull();
  });

  it("without the key, or with no address to forward: no header, as before", async () => {
    vi.stubEnv("API_ORIGIN", "https://backend.example.test");
    const { fetch, calls } = recorder();
    vi.stubGlobal("fetch", fetch);
    nextHeaders.value = new Headers({ "x-forwarded-for": CLIENT });
    vi.stubEnv("FRONTEND_FORWARD_KEY", "");
    await (await (await load()).serverApi()).GET("/api/v1/session");
    vi.stubEnv("FRONTEND_FORWARD_KEY", KEY);
    nextHeaders.value = new Headers();
    await (await (await load()).serverApi()).GET("/api/v1/session");
    expect(calls).toHaveLength(2);
    for (const c of calls) expect(c.headers.get(VISITOR_HEADER)).toBeNull();
  });
});
