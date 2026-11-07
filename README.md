# visigain-frontend

The Visigain website and client dashboard: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind 4. It
talks to the backend **only through its API**, `/api/v1/...`, on the same domain (no CORS). The data, the words, the
switches and the legal text all come from the backend; this repository draws them.

- The contract: [`api/openapi.yaml`](api/openapi.yaml) (a copy; the backend owns it) and its rules,
  [`docs/api.md`](docs/api.md) and [`docs/wordings.md`](docs/wordings.md) (the backend's `docs/api/README.md` and `docs/api/wordings.md`, copied
  by `pnpm api:sync`; paths in them are the backend's).
- How to work here: [`CONTRIBUTING.md`](CONTRIBUTING.md), then [`docs/frontend-guide.md`](docs/frontend-guide.md),
  [`docs/design-handoff.md`](docs/design-handoff.md) and [`TOKENS.md`](TOKENS.md).
- This is **Next.js 16**: `src/proxy.ts`, not `middleware.ts`, and other changes. When an API looks unfamiliar, read
  the guide in `node_modules/next/dist/docs/` first ([`AGENTS.md`](AGENTS.md)).

## Day 1

You need Git, **Node 22** or newer and **pnpm 8.10.5** (the `packageManager` field of `package.json`; install pnpm
the way your system prefers, for example from pnpm.io). No key, no secret, no cloud access.

```bash
git clone https://github.com/visigain/visigain-frontend.git
cd visigain-frontend
pnpm i
pnpm exec playwright install chromium   # once, for the smoke test
```

Two terminals:

```bash
pnpm mock            # the Prism mock of the API on http://127.0.0.1:4010 (from api/openapi.yaml and api/examples)
MOCK=1 pnpm dev      # the app on http://127.0.0.1:3000, with /api/v1/* rewritten to the mock
```

On Windows PowerShell, the second is `$env:MOCK="1"; pnpm dev`.

Open http://127.0.0.1:3000/example: a few wordings by key and the prices from `GET /api/v1/pricing`. It proves the
wiring and is not a designed page. A key the mock's catalogue lacks shows as the key itself (for example
`common.theme.light`): that is a question for Backend, never a sentence to type (CONTRIBUTING.md).

**The mock.** Every answer is an example from the spec. Pick another with the header `Prefer: example=<name>` (the
dashboard overview has `monitoring`, `report` and `free`), or another status with `Prefer: code=429`. A session call
needs a cookie, any value: `curl -H "Cookie: vg_session=mock" http://127.0.0.1:4010/api/v1/session`.

## The checks

```bash
pnpm typecheck      # tsc, strict
pnpm lint           # the token check, then ESLint (no literal text in JSX)
pnpm format:check   # Prettier (pnpm format writes)
pnpm test           # Vitest: t(), the wordings loader, the client, the keys, the tokens
pnpm build          # the production build
pnpm test:e2e       # Playwright smoke: starts the mock and a MOCK=1 build, both themes at 1440 and 375 px
```

CI (`.github/workflows/ci.yml`, GitHub Actions) runs the same, in that order, on every pull request and on `main`.

## Where calls go

| mode                          | the browser calls                                            | the app's own server calls                                |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| `MOCK=1`                      | `/api/v1/*` on its own origin, rewritten to the mock         | the mock (`MOCK_ORIGIN`, default `http://127.0.0.1:4010`) |
| development, `API_ORIGIN` set | `/api/v1/*`, rewritten to `API_ORIGIN`                       | `API_ORIGIN`                                              |
| production                    | `/api/v1/*`: the load balancer sends `/api/*` to the backend | `API_ORIGIN` (open: decided in Phase 3)                   |

`src/api/origin.ts` decides this; `next.config.ts` holds the rewrite. Rewrites are read when the dev server starts or
the app is built, so restart after changing `MOCK` or `API_ORIGIN`. `.env.example` lists every variable, all blank.

## Pointing at staging (frontend-staging, Phase 3b)

Staging is private: every request carries a Google identity allowed to call it. Once Raf has granted your Google
account `roles/run.invoker` on `backend-staging` and `frontend-staging`:

1. Install the Google Cloud CLI and `gcloud auth login` with that account.
2. Run your app as usual: `pnpm dev` on http://127.0.0.1:3000, with `API_ORIGIN=http://127.0.0.1:3200` and
   `SITE_ORIGIN=http://127.0.0.1:3200` in `.env.local`.
3. In the backend repository, run the staging proxy in its one-origin mode:
   `node deploy/staging-proxy.mjs <backend-staging URL> 3200 --frontend http://127.0.0.1:3000` (Backend gives you
   the URL). It sends `/api/**` and the backend-for-good paths ([`docs/api.md`](docs/api.md), "Paths at the switch",
   list (a); the code is the backend's `deploy/backend-paths.mjs`) to `backend-staging`, signed with your own Google
   identity (the token is never printed), and everything else to your `next dev`, unsigned. With the frontend-staging URL after
   `--frontend` instead, it shows the deployed frontend, signed the same way.
4. Open http://127.0.0.1:3200. The browser sees one origin, as in production, so the session cookie and the
   backend's Origin check on every non-GET work as they will on visigain.com.

**The deployed image.** `Dockerfile` builds Next's standalone server (`NEXT_OUTPUT=standalone`, Node 22, a non-root
user, port 8080). The backend's `deploy/20-frontend-staging.sh` builds it with Docker on Raf's PC and deploys
`frontend-staging` with `API_ORIGIN` and `SITE_ORIGIN` set to backend-staging's address and `API_ID_TOKEN=metadata`.
With that flag this app's server fetches an ID token for the `API_ORIGIN` audience from the metadata server, holds it
for 45 minutes and sends it as `Authorization: Bearer` beside the visitor's own cookie (`src/api/id-token.ts`). The
browser never gets it. To try the image locally against the mock: `pnpm mock`, then
`docker build -t visigain-frontend . && docker run --rm -p 127.0.0.1:3080:8080 -e MOCK=1 -e MOCK_ORIGIN=http://host.docker.internal:4010 visigain-frontend`
and open http://127.0.0.1:3080/example.

**Next's files are at `/fe/_next/...`** (`assetPrefix`, `src/site/asset-prefix.ts`), in `pnpm dev`, `pnpm start` and
the image alike. At the switch one load balancer serves both apps on visigain.com: `/_next/**` stays with the backend
(its own pages load their files from there) and `/fe/**` comes here. So no page of this app lives under `/fe`, and
every answer carries `x-served-by: frontend` (the switch's checks read it; the backend's says `backend`).

Staging sends no email: for a signed-in page, ask Backend for a one-time sign-in link for an invented `.test` client.
You never get, need or call production.

**Open (Phase 3): production's `API_ORIGIN`.** In production the browser's `/api/*` goes through the load balancer,
but this app's server calls the backend at `API_ORIGIN`. Which address that is has not been decided; likely the
backend's own run.app address, called with an ID token.

## The contract

`src/api/client` and `src/api/generated` are copied from the backend, as they are; `api/openapi.yaml` and
`api/examples` are the copy the mock serves. Never edit them here. When Backend changes the contract:

```bash
BACKEND_REPO=../visigain-backend pnpm api:sync      # copy the client, the types, the spec and its examples
pnpm api:sync --spec path/to/openapi.yaml            # or: copy a spec (and its examples) and regenerate the types
pnpm typecheck && pnpm test
```

Commit the result on its own ("API: contract synced from backend <sha>").

## Layout

```
api/                 the spec and examples the mock serves (copied)
src/api/             the client and types (copied), plus origin.ts, server.ts, browser.ts
src/app/             routes (App Router); layout.tsx has the theme and the holding switch
src/brand/tokens.ts  every design value (TOKENS.md)
src/components/      components
src/proxy.ts         Next 16's proxy: hands the path to the layout
src/site/            GET /site: the switches and the holding page rule
src/theme/           the theme cookie and its server action
src/wordings/        t(), the catalogue loader, the keys awaiting Backend
tests/               Vitest
e2e/                 Playwright
docs/                the guides for this repository
```
