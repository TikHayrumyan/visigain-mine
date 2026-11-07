import type { components } from "@/api/client";

export type Site = components["schemas"]["Site"];

/** Normalise a path for the holding list: no query, no trailing slash (except "/"). */
function normalise(path: string): string {
  const bare = path.split(/[?#]/)[0] || "/";
  return bare.length > 1 ? bare.replace(/\/+$/, "") : bare;
}

/**
 * Whether this path shows the holding page: the switch is on and the path is not one of `holdingPages`
 * (docs/api/README.md, "The switches"). While holding, the pages that stay are served as they are.
 */
export function showsHoldingPage(site: Pick<Site, "holding" | "holdingPages">, path: string): boolean {
  if (!site.holding) return false;
  const here = normalise(path);
  return !site.holdingPages.some((p) => normalise(p) === here);
}

/** What the app assumes when GET /site cannot be read: holding, with no page open. It fails closed. */
export const SITE_UNREACHABLE: Pick<Site, "holding" | "holdingPages"> = { holding: true, holdingPages: [] };
