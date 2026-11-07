import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { config as proxyConfig } from "@/proxy";
import { ASSET_PREFIX, SERVED_BY } from "@/site/asset-prefix";

/**
 * The switch (the backend's deploy/22-frontend-switch.sh) sends /_next/** to the backend and /fe/** to this app, and
 * tells the two apps apart by x-served-by. These hold the config to that.
 */
describe("the asset prefix and the x-served-by header", () => {
  it("Next's files are under /fe, a prefix the backend's paths never use", () => {
    expect(ASSET_PREFIX).toBe("/fe");
    expect(nextConfig.assetPrefix).toBe(ASSET_PREFIX);
    // No basePath: the pages keep their own addresses (emails link to them).
    expect(nextConfig.basePath).toBeUndefined();
  });

  it("every answer says x-served-by: frontend", async () => {
    const rules = await nextConfig.headers!();
    const all = rules.find((r) => r.source === "/:path*");
    expect(all?.headers).toContainEqual({ key: "x-served-by", value: "frontend" });
    expect(SERVED_BY).toEqual({ key: "x-served-by", value: "frontend" });
  });

  it("the proxy skips the prefixed files", () => {
    const matcher = new RegExp(`^${proxyConfig.matcher[0]!}$`);
    expect(matcher.test("/fe/_next/static/chunks/main.js")).toBe(false);
    expect(matcher.test("/api/v1/site")).toBe(false);
    expect(matcher.test("/dashboard")).toBe(true);
    expect(matcher.test("/")).toBe(true);
  });

  it("the Docker image copies the built files where the standalone server serves the prefix from", () => {
    const docker = readFileSync("Dockerfile", "utf8");
    expect(docker).toContain("COPY --from=build --chown=app:app /app/.next/static ./.next/static");
  });
});
