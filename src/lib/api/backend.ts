import "server-only";

const DEFAULT_API_ORIGIN = "https://origin.visigain.com";

/**
 * Origin the backend allowlists. A browser on localhost is refused (`cross_site_refused`),
 * so server-side calls name the public site. Override with `VISIGAIN_SITE_ORIGIN`.
 */
const DEFAULT_SITE_ORIGIN = "https://visigain.com";

export function backendApiOrigin(): string {
  return (process.env.VISIGAIN_API_ORIGIN ?? DEFAULT_API_ORIGIN).replace(/\/$/, "");
}

export function backendSiteOrigin(): string {
  return (process.env.VISIGAIN_SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN).replace(/\/$/, "");
}
