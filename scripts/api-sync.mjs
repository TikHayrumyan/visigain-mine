#!/usr/bin/env node
/**
 * Brings the API contract into this repository. The backend owns it; nothing here is edited by hand.
 *
 *   BACKEND_REPO=../visigain-backend pnpm api:sync
 *       copies from a backend checkout, as they are:
 *         api/client/index.ts          -> src/api/client/index.ts
 *         api/generated/schema.d.ts    -> src/api/generated/schema.d.ts
 *         api/openapi.yaml, examples/  -> api/openapi.yaml, api/examples/   (what `pnpm mock` serves)
 *         docs/api/README.md           -> docs/api.md                       (the contract's rules)
 *         docs/api/wordings.md         -> docs/wordings.md                  (the catalogue's rules)
 *
 *   pnpm api:sync --spec path/to/openapi.yaml       (or OPENAPI_YAML=path/to/openapi.yaml)
 *       copies that spec (and the examples/ folder beside it, which it references) into api/, then regenerates
 *       src/api/generated/schema.d.ts from it with openapi-typescript. The client is left as it is.
 *
 * Then: `pnpm typecheck && pnpm test`, and commit the result in its own commit ("API: contract synced from <sha>").
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const specArg = args.includes("--spec") ? args[args.indexOf("--spec") + 1] : process.env.OPENAPI_YAML;
const backend = process.env.BACKEND_REPO;

function fail(message) {
  console.error(`api:sync: ${message}`);
  process.exit(1);
}

function copyFile(from, to) {
  if (!existsSync(from)) fail(`${from} does not exist`);
  mkdirSync(path.dirname(to), { recursive: true });
  cpSync(from, to);
  console.log(`  ${path.relative(ROOT, to)}  <-  ${from}`);
}

function copySpec(spec) {
  copyFile(spec, path.join(ROOT, "api/openapi.yaml"));
  const examples = path.join(path.dirname(spec), "examples");
  if (existsSync(examples)) {
    rmSync(path.join(ROOT, "api/examples"), { recursive: true, force: true });
    cpSync(examples, path.join(ROOT, "api/examples"), { recursive: true });
    console.log(`  api/examples/  <-  ${examples}`);
  }
}

if (specArg) {
  const spec = path.resolve(specArg);
  console.log(`api:sync from the spec ${spec}`);
  copySpec(spec);
  const bin = path.join(ROOT, "node_modules/openapi-typescript/bin/cli.js");
  execFileSync(
    process.execPath,
    [bin, path.join(ROOT, "api/openapi.yaml"), "-o", path.join(ROOT, "src/api/generated/schema.d.ts")],
    {
      stdio: "inherit",
    },
  );
} else if (backend) {
  const repo = path.resolve(backend);
  console.log(`api:sync from the backend checkout ${repo}`);
  copyFile(path.join(repo, "api/client/index.ts"), path.join(ROOT, "src/api/client/index.ts"));
  copyFile(path.join(repo, "api/generated/schema.d.ts"), path.join(ROOT, "src/api/generated/schema.d.ts"));
  copySpec(path.join(repo, "api/openapi.yaml"));
  copyFile(path.join(repo, "docs/api/README.md"), path.join(ROOT, "docs/api.md"));
  copyFile(path.join(repo, "docs/api/wordings.md"), path.join(ROOT, "docs/wordings.md"));
} else {
  fail(
    "say where the contract is: BACKEND_REPO=<backend checkout> pnpm api:sync, or pnpm api:sync --spec <openapi.yaml>",
  );
}
console.log("api:sync done. Next: pnpm typecheck && pnpm test");
