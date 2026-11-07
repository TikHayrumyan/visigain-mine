import type { NextConfig } from "next";
import { apiRewriteTarget } from "./src/api/origin";
import { ASSET_PREFIX, SERVED_BY } from "./src/site/asset-prefix";

/**
 * The browser only ever calls its own origin: `/api/v1/...`. Where that goes:
 * - MOCK=1: rewritten to the Prism mock (`pnpm mock`, http://127.0.0.1:4010), in development and in a build made
 *   with MOCK=1 (the smoke test's);
 * - development without MOCK: rewritten to API_ORIGIN (the staging proxy on your laptop, or a local backend);
 * - production: no rewrite. The load balancer sends `/api/*` to the backend before a request reaches this app.
 * Rewrites are read when the app is built or the dev server starts: change MOCK or API_ORIGIN, then restart.
 */
const nextConfig: NextConfig = {
  // The Docker image (Dockerfile) sets NEXT_OUTPUT=standalone: a self-contained server.js with only the files it
  // needs. Everywhere else (`pnpm build && pnpm start`, CI's smoke test) the output stays the default.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // Next's own files at /fe/_next/... (src/site/asset-prefix.ts): the load balancer keeps /_next/** for the backend.
  assetPrefix: ASSET_PREFIX,
  poweredByHeader: false,
  reactStrictMode: true,
  // No floating dev badge (it lands in screenshots and accessibility runs).
  devIndicators: false,
  async rewrites() {
    const target = apiRewriteTarget(process.env);
    return target ? [{ source: "/api/v1/:path*", destination: `${target}/api/v1/:path*` }] : [];
  },
  async headers() {
    // x-served-by: frontend on every answer, the files too: the switch's checks tell the two apps apart by it.
    return [{ source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, SERVED_BY] }];
  },
};

export default nextConfig;
