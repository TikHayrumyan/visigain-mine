/**
 * The frontend's own prefix for Next's built files: `/fe/_next/static/...`, never `/_next/...`.
 *
 * At the switch (the backend's deploy/22-frontend-switch.sh), one load balancer serves both apps on visigain.com. The
 * backend's pages that stay on the backend for good (emails' links, admin, the PDFs) load THEIR files from
 * `/_next/...`, so the load balancer sends `/_next/**` to the backend, and `/fe/**` (with every other page) to this app.
 * Next serves the files under the prefix itself (in `next dev`, `next start` and the standalone server of the Docker
 * image): no rewrite and no copy are needed. The files of a `public/` folder are not prefixed (Next's assetPrefix
 * guide): when one is added, its paths must not be on the backend's list (docs/api.md, "Paths at the switch").
 *
 * No page of this app may live under `/fe`. src/proxy.ts's matcher skips `/fe/_next/` (it must be a literal there).
 */
export const ASSET_PREFIX = "/fe";

/** The response header that says which app answered (the switch's checks read it): this app's value. */
export const SERVED_BY = { key: "x-served-by", value: "frontend" } as const;
