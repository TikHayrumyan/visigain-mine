import { describe, expect, it } from "vitest";
import { createClient, fillPath, idempotencyKey, queryString, wordingParts } from "@/api/client";
import { apiRewriteTarget, serverApiOrigin } from "@/api/origin";
import pricing from "../api/examples/pricing.json";

function recordingFetch(status: number, body: unknown, contentType = "application/json") {
  const calls: { url: string; init: RequestInit; headers: Headers }[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init, headers: new Headers(init.headers) });
    return new Response(body === undefined ? null : typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "content-type": contentType },
    });
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

describe("the API client (copied from the backend's api/client)", () => {
  it("fills path parameters, encoded, and refuses a missing one", () => {
    expect(fillPath("/api/v1/reports/{id}", { id: "a b/c" })).toBe("/api/v1/reports/a%20b%2Fc");
    expect(() => fillPath("/api/v1/reports/{id}", {})).toThrow(/Missing path parameter: id/);
  });

  it("writes a query string, leaving out empty values", () => {
    expect(queryString({ b: "sunset-glow-medspa.test", cursor: undefined, limit: 20 })).toBe(
      "?b=sunset-glow-medspa.test&limit=20",
    );
    expect(queryString({})).toBe("");
  });

  it("GETs from the base URL with the session's credentials and returns the data", async () => {
    const { fetch, calls } = recordingFetch(200, pricing.value);
    const api = createClient({ baseUrl: "http://127.0.0.1:4010/", fetch, headers: { cookie: "vg_session=mock" } });
    const { data, error } = await api.GET("/api/v1/pricing");
    expect(error).toBeUndefined();
    expect(data?.fullReport.amountCents).toBe(9900);
    expect(calls[0]!.url).toBe("http://127.0.0.1:4010/api/v1/pricing");
    expect(calls[0]!.init.credentials).toBe("same-origin");
    expect(calls[0]!.init.redirect).toBe("manual");
    expect(calls[0]!.headers.get("cookie")).toBe("vg_session=mock");
    expect(calls[0]!.headers.get("accept")).toBe("application/json");
  });

  it("returns the API's error shape as it is", async () => {
    const body = { error: { code: "rate_limited", message_key: "errors.rate_limited" } };
    const { fetch } = recordingFetch(429, body);
    const { data, error, response } = await createClient({ baseUrl: "", fetch }).GET("/api/v1/site");
    expect(data).toBeUndefined();
    expect(error).toEqual(body);
    expect(response.status).toBe(429);
  });

  it("turns an answer that is not the API's shape into the generic error key", async () => {
    const { fetch } = recordingFetch(502, "<html>Bad gateway</html>", "text/html");
    const { error } = await createClient({ baseUrl: "", fetch }).GET("/api/v1/site");
    expect(error).toEqual({
      error: { code: "http_502", message_key: "errors.global_error.something_went_wrong_on_our_side" },
    });
  });

  it("sends a JSON body and, on a server, the site's Origin with a POST", async () => {
    const { fetch, calls } = recordingFetch(204, undefined);
    const api = createClient({ baseUrl: "http://api.test", fetch, origin: "https://visigain.test" });
    await api.POST("/api/v1/auth/sign-out");
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.headers.get("origin")).toBe("https://visigain.test");
  });

  it("builds a plain link for a GET (the PDF, the grid map)", () => {
    const api = createClient({ baseUrl: "" });
    expect(api.href("/api/v1/reports/{id}/pdf", { path: { id: "r1" } })).toBe("/api/v1/reports/r1/pdf");
  });

  it("makes a fresh idempotency key each time", () => {
    const a = idempotencyKey();
    expect(a).toMatch(/^[0-9a-f]{48}$/);
    expect(idempotencyKey()).not.toBe(a);
  });

  it("reads a Wording as its key and params", () => {
    expect(wordingParts("site.a")).toEqual({ key: "site.a", params: {} });
    expect(wordingParts({ key: "site.b", params: { n: 1 } })).toEqual({ key: "site.b", params: { n: 1 } });
  });
});

describe("where calls go", () => {
  it("MOCK=1 goes to the mock, server-side and through the rewrite", () => {
    expect(serverApiOrigin({ MOCK: "1" })).toBe("http://127.0.0.1:4010");
    expect(apiRewriteTarget({ MOCK: "1", NODE_ENV: "production" })).toBe("http://127.0.0.1:4010");
    expect(serverApiOrigin({ MOCK: "1", MOCK_ORIGIN: "http://127.0.0.1:4999/" })).toBe("http://127.0.0.1:4999");
  });

  it("otherwise API_ORIGIN, rewritten only in development", () => {
    expect(serverApiOrigin({ API_ORIGIN: "http://localhost:3200/" })).toBe("http://localhost:3200");
    expect(apiRewriteTarget({ API_ORIGIN: "http://localhost:3200", NODE_ENV: "development" })).toBe(
      "http://localhost:3200",
    );
    expect(apiRewriteTarget({ API_ORIGIN: "http://backend.internal", NODE_ENV: "production" })).toBeNull();
    expect(() => serverApiOrigin({})).toThrow(/API_ORIGIN is not set/);
  });
});
