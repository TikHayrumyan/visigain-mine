/**
 * A small typed fetch wrapper for the Visigain API (/api/v1), typed from api/generated/schema.d.ts (pnpm api:types).
 * No dependency and no backend import: this folder is copied into the frontend repository as it is.
 *
 *   const api = createClient({ baseUrl: "" });                       // in the browser: same origin
 *   const { data, error } = await api.GET("/api/v1/dashboard/overview", { params: { query: { b: "sunset-glow-medspa.test" } } });
 *   if (error) show(error.error.message_key);                         // errors are wording keys, never sentences
 *
 * The browser sends the session cookie (credentials "same-origin") and the Origin header by itself; the backend refuses
 * a non-GET without an Origin equal to its host. On the frontend's own server (rendering a page), pass `origin` (the
 * site's origin) and `headers` (the visitor's Cookie), which no browser adds there.
 */
import type { components, paths } from "../generated/schema";

export type { components, paths };
export type Schemas = components["schemas"];
export type ApiError = Schemas["Error"];
export type Wording = Schemas["Wording"];

type HttpMethod = "get" | "post";
type PathsWith<M extends HttpMethod> = { [P in keyof paths]: paths[P][M] extends undefined | never ? never : P }[keyof paths];
type Operation<P extends keyof paths, M extends HttpMethod> = NonNullable<paths[P][M]>;
type Responses<O> = O extends { responses: infer R } ? R : never;
type JsonOf<R> = R extends { content: { "application/json": infer J } } ? J : undefined;
type SuccessCode = 200 | 201 | 202 | 204 | 304;
type ErrorCode = 401 | 403 | 404 | 409 | 410 | 413 | 422 | 429 | 503;
type DataOf<O> = { [C in keyof Responses<O>]: C extends SuccessCode ? JsonOf<Responses<O>[C]> : never }[keyof Responses<O>];
type Params<O> = O extends { parameters: infer P } ? P : never;
type BodyOf<O> = O extends { requestBody: { content: { "application/json": infer B } } } ? B : O extends { requestBody?: { content: { "application/json": infer B } } } ? B | undefined : undefined;
type HasRequired<T> = [T] extends [never] ? false : {} extends T ? false : true;
type ParamsOption<O> = Omit<Params<O>, "cookie"> extends infer P ? (HasRequired<{ [K in keyof P as P[K] extends never | undefined ? never : K]: P[K] }> extends true ? { params: Clean<P> } : { params?: Clean<P> }) : never;
type Clean<P> = { [K in keyof P as P[K] extends never | undefined ? never : K]: P[K] };
type BodyOption<O> = O extends { requestBody: unknown } ? { body: BodyOf<O> } : O extends { requestBody?: unknown } ? { body?: BodyOf<O> } : { body?: never };
export type RequestOptions<O> = ParamsOption<O> & BodyOption<O> & { signal?: AbortSignal };

export type Result<O> =
  | { data: DataOf<O>; error?: undefined; response: Response }
  | { data?: undefined; error: ApiError; response: Response };

export interface ClientOptions {
  /** "" in the browser (same origin), or e.g. "https://visigain.com" / "http://127.0.0.1:4010" (the mock) on a server. */
  baseUrl: string;
  /** Sent as the Origin header where the runtime does not add one (server-side rendering). Ignored in a browser. */
  origin?: string;
  /** Extra headers on every call, e.g. the visitor's Cookie when rendering on the frontend's server. */
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  /** A fetch to use instead of the global one. */
  fetch?: typeof fetch;
}

const inBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

/** "/api/v1/reports/{id}" + { id } -> "/api/v1/reports/<id>" (each value encoded). */
export function fillPath(path: string, values: Record<string, unknown> | undefined): string {
  return path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const v = values?.[name];
    if (v === undefined || v === null) throw new Error(`Missing path parameter: ${name}`);
    return encodeURIComponent(String(v));
  });
}

export function queryString(values: Record<string, unknown> | undefined): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(values ?? {})) if (v !== undefined && v !== null) q.append(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** A fallback error when the answer is not the API's own error shape (a proxy, a network failure page). */
const unknownError = (status: number): ApiError => ({ error: { code: status === 0 ? "network" : `http_${status}`, message_key: "errors.global_error.something_went_wrong_on_our_side" } });

export function createClient(options: ClientOptions) {
  const doFetch = options.fetch ?? fetch;
  async function call<O>(method: "GET" | "POST", path: string, opts: { params?: { path?: Record<string, unknown>; query?: Record<string, unknown>; header?: Record<string, unknown> }; body?: unknown; signal?: AbortSignal } = {}): Promise<Result<O>> {
    const url = options.baseUrl.replace(/\/$/, "") + fillPath(path, opts.params?.path) + queryString(opts.params?.query);
    const headers = new Headers(typeof options.headers === "function" ? await options.headers() : options.headers);
    headers.set("accept", "application/json");
    for (const [k, v] of Object.entries(opts.params?.header ?? {})) if (v !== undefined && v !== null) headers.set(k, String(v));
    if (method !== "GET" && options.origin && !inBrowser()) headers.set("origin", options.origin);
    let body: string | undefined;
    if (opts.body !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(opts.body);
    }
    const response = await doFetch(url, { method, headers, body, credentials: "same-origin", redirect: "manual", signal: opts.signal });
    const json = response.status === 204 || response.status === 304 ? undefined : (response.headers.get("content-type") ?? "").includes("json") ? await response.json().catch(() => undefined) : undefined;
    if (response.ok || response.status === 304) return { data: json as DataOf<O>, response };
    const isApiError = !!json && typeof json === "object" && "error" in json && typeof (json as ApiError).error?.message_key === "string";
    return { error: isApiError ? (json as ApiError) : unknownError(response.status), response };
  }
  return {
    GET<P extends PathsWith<"get">>(path: P, ...[opts]: HasRequired<ParamsOption<Operation<P, "get">>> extends true ? [RequestOptions<Operation<P, "get">>] : [RequestOptions<Operation<P, "get">>?]) {
      return call<Operation<P, "get">>("GET", path as string, opts as never);
    },
    POST<P extends PathsWith<"post">>(path: P, ...[opts]: HasRequired<ParamsOption<Operation<P, "post">> & BodyOption<Operation<P, "post">>> extends true ? [RequestOptions<Operation<P, "post">>] : [RequestOptions<Operation<P, "post">>?]) {
      return call<Operation<P, "post">>("POST", path as string, opts as never);
    },
    /** The address of a GET for a plain link or <img> (the report PDF, the grid map): same session, no fetch. */
    href<P extends PathsWith<"get">>(path: P, params?: { path?: Record<string, unknown>; query?: Record<string, unknown> }) {
      return options.baseUrl.replace(/\/$/, "") + fillPath(path as string, params?.path) + queryString(params?.query);
    },
  };
}

/** A fresh Idempotency-Key for one checkout press (keep it for retries of the same press). */
export function idempotencyKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A Wording as its key and params, whichever form it came in. */
export function wordingParts(w: Wording): { key: string; params: Record<string, string | number> } {
  return typeof w === "string" ? { key: w, params: {} } : { key: w.key, params: w.params ?? {} };
}

export type ApiClient = ReturnType<typeof createClient>;
