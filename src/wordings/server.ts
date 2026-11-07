import "server-only";
import { cache } from "react";
import { publicApi } from "@/api/server";
import { mockOn } from "@/api/origin";
import { createWordingsLoader, type Locale, type Namespace } from "./catalogue";
import { createT, type T } from "./t";

/** One loader for the whole server process: each namespace is held in memory and re-checked by its version. */
let loader: ReturnType<typeof createWordingsLoader> | undefined;
function wordings() {
  loader ??= createWordingsLoader({ api: publicApi(), mock: mockOn(process.env) });
  return loader;
}

/** The namespaces every page needs. A page adds its own (`getT(["checkout"])`). */
export const BASE_NAMESPACES: readonly Namespace[] = ["common", "site", "errors"];

/** t() for this request, over the base namespaces plus the page's own (deduplicated within one render). */
export const getT = cache(async (extra: readonly Namespace[] = [], locale: Locale = "en"): Promise<T> => {
  const namespaces = [...new Set([...BASE_NAMESPACES, ...extra])];
  const entries = await wordings().loadMany(locale, namespaces);
  return createT(entries, { locale });
});
