import "server-only";
import { publicApi } from "@/api/server";
import { SITE_UNREACHABLE, type Site } from "./holding";

/** GET /site is read on every render and held for at most 30 seconds (the API asks for at most 60). */
const TTL_MS = 30_000;
let held: { site: Site; at: number } | undefined;

export type SiteState = Site | (typeof SITE_UNREACHABLE & Partial<Site>);

export async function loadSite(): Promise<SiteState> {
  if (held && Date.now() - held.at < TTL_MS) return held.site;
  try {
    const { data } = await publicApi().GET("/api/v1/site");
    if (data) {
      held = { site: data, at: Date.now() };
      return data;
    }
  } catch {
    // The API could not be reached: fall through.
  }
  return held?.site ?? SITE_UNREACHABLE;
}
