/**
 * The wordings catalogue loader, without Next: one namespace at a time, held in memory and revalidated by its version.
 *
 * GET /api/v1/wordings answers `{ locale, version, entries }`; `version` is the catalogue's content hash and also its
 * ETag. A namespace is fetched once, then re-checked at most every `ttlMs` with If-None-Match: a 304 (or the same
 * version) keeps what is held. When the API cannot be reached, the last catalogue held is used; with none, the call
 * throws, so a page never renders with invented words.
 */
import type { ApiClient, components } from "@/api/client";

export type Locale = components["schemas"]["Locale"];
export type Namespace = components["schemas"]["WordingNamespace"];
export type Entries = Readonly<Record<string, string>>;

interface Held {
  version: string;
  etag: string;
  entries: Entries;
  checkedAt: number;
}

export interface LoaderOptions {
  api: ApiClient;
  /** How long a held namespace is used before it is re-checked (default 60 s). */
  ttlMs?: number;
  now?: () => number;
  /**
   * With the Prism mock, ask for the example named after the namespace (`Prefer: example=errors`), since the mock
   * otherwise answers its first example whatever `ns` says. Falls back to the plain answer.
   */
  mock?: boolean;
}

const asEtag = (header: string | null, version: string) =>
  header && /^(W\/)?"/.test(header) ? header : `"${version}"`;

export function createWordingsLoader(options: LoaderOptions) {
  const ttlMs = options.ttlMs ?? 60_000;
  const now = options.now ?? Date.now;
  const held = new Map<string, Held>();

  async function fetchNamespace(locale: Locale, ns: Namespace, previous: Held | undefined) {
    const header: { "If-None-Match"?: string } = previous ? { "If-None-Match": previous.etag } : {};
    const query = { locale, ns };
    if (options.mock) {
      // Prefer is Prism's header, not the spec's, so it is not in the generated types.
      const preferred = await options.api.GET("/api/v1/wordings", {
        params: { query, header: { ...header, Prefer: `example=${ns}` } as typeof header },
      });
      if (!preferred.error) return preferred;
    }
    return options.api.GET("/api/v1/wordings", { params: { query, header } });
  }

  async function load(locale: Locale, ns: Namespace): Promise<Entries> {
    const id = `${locale}:${ns}`;
    const previous = held.get(id);
    if (previous && now() - previous.checkedAt < ttlMs) return previous.entries;
    let result: Awaited<ReturnType<typeof fetchNamespace>>;
    try {
      result = await fetchNamespace(locale, ns, previous);
    } catch (cause) {
      if (previous) return previous.entries;
      throw new Error(`wordings: ${id} could not be loaded`, { cause });
    }
    if (result.response.status === 304 && previous) {
      previous.checkedAt = now();
      return previous.entries;
    }
    if (result.data) {
      const { version, entries } = result.data;
      if (previous && previous.version === version) {
        previous.checkedAt = now();
        return previous.entries;
      }
      held.set(id, { version, etag: asEtag(result.response.headers.get("etag"), version), entries, checkedAt: now() });
      return entries;
    }
    if (previous) return previous.entries;
    throw new Error(`wordings: ${id} answered ${result.response.status} (${result.error?.error.code ?? "no body"})`);
  }

  /** Several namespaces merged into one table. */
  async function loadMany(locale: Locale, namespaces: readonly Namespace[]): Promise<Entries> {
    const tables = await Promise.all(namespaces.map((ns) => load(locale, ns)));
    return Object.assign({}, ...tables) as Entries;
  }

  return { load, loadMany, versionOf: (locale: Locale, ns: Namespace) => held.get(`${locale}:${ns}`)?.version };
}
