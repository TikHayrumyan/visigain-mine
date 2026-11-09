# visigain-frontend

The Visigain public website at **visigain.com**: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind 4.
It talks to the backend **only through its API**, `/api/v1/...`, on the same domain (no CORS). The data, the words,
the switches and the legal text all come from the backend; this repository draws them.

**This repository covers only the public pages:** home, pricing, the free scan and its result, the sample report,
FAQ, articles, about, contact and legal. **The dashboard, checkout and account are in
[visigain-app](https://github.com/visigain/visigain-app)** (app.visigain.com): sign-in, the five dashboard pages,
reports and PDFs, checkout ($99 and $149), account, invoices and cancel, and later the Monitoring sub-pages, fixers
and chat. Never build those pages here.

- The contract: [`api/openapi.yaml`](api/openapi.yaml) (a copy; the backend owns it) and its rules,
  [`docs/api.md`](docs/api.md) and [`docs/wordings.md`](docs/wordings.md) (the backend's `docs/api/README.md` and `docs/api/wordings.md`, copied
  by `pnpm api:sync`; paths in them are the backend's).
- How to work here: [`CONTRIBUTING.md`](CONTRIBUTING.md), then [`docs/frontend-guide.md`](docs/frontend-guide.md),
  [`docs/design-handoff.md`](docs/design-handoff.md) and [`TOKENS.md`](TOKENS.md).
- This is **Next.js 16**: `src/proxy.ts`, not `middleware.ts`, and other changes. When an API looks unfamiliar, read
  the guide in `node_modules/next/dist/docs/` first ([`AGENTS.md`](AGENTS.md)).

## Two frontends, one backend

| host                 | repository                       | serves                                                                                           | the load balancer sends to the backend                                                           |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `visigain.com`       | **visigain-frontend (this one)** | home, pricing, the free scan and its result, sample report, FAQ, articles, about, contact, legal | `/api/v1/**`, the backend-for-good list (`docs/api.md`, "Paths at the switch", (a)), `/_next/**` |
| `app.visigain.com`   | visigain-app                     | sign-in, the dashboard, reports and PDFs, checkout, account, invoices, cancel                    | `/api/v1/**`, the auth callbacks (`/auth/google/**`, Connect Google's), the PDF and image routes |
| `admin.visigain.com` | visigain-backend                 | the admin panel                                                                                  | everything                                                                                       |

Each host is one origin. This app's files are under `/fe/_next/...` and its answers say `x-served-by: frontend`; the
customer app has no asset prefix and says `x-served-by: app`. The tokens, the API client and the lint rules are
copied in both repositories (no shared package), each synced from the backend and checked by its own CI.

**The links from here to the customer app:**

- **The scan result's buttons.** "Get the Full Report" and "Monitoring" on `/scan/[token]` are
  `ScanResultCheckoutLinks`, linking to `https://app.visigain.com/checkout/report?domain=<domain>` and
  `/checkout/monitoring?domain=<domain>` (`src/site/checkout-links.ts`; [`docs/frontend-guide.md`](docs/frontend-guide.md)).
- **The "Dashboard" link.** It shows when the `vg_signed_in=1` hint cookie (on `.visigain.com`, not HttpOnly, no
  secret in it) is present, and links to `https://app.visigain.com/dashboard`. The session cookie itself is
  host-only on app.visigain.com: this app never sees it, so never call a signed-in endpoint from here.
- **Every link to the app is an `AppLink`** (`src/components/app-link.tsx`, a server component). A referral link
  (`/r/<code>`, the backend's) leaves the code in the `vg_ref` cookie on this host only (HttpOnly), and the app's
  checkout reads it on its own host. So `AppLink` reads `vg_ref` on the server and, when it is a valid code (the
  backend's rule, copied in `src/site/referral.ts`: upper case, eight characters of `A-HJKMNP-Z2-9`), adds
  `?vg_ref=<code>` to the address; the app keeps it as its own cookie. Anything else adds nothing. The app's origin is
  `APP_ORIGIN`, else `https://app.visigain.com`. `tests/referral.test.tsx` fails when another file writes the app's
  address.
- **Old addresses.** `visigain.com/dashboard/...`, `/account`, `/signin`, `/auth/verify` and `/checkout/...` answer
  a 308 to the same path on app.visigain.com (the load balancer's, set up by Backend), so emails keep working.

## Day 1

You need Git, **Node 22** or newer and **pnpm 8.10.5** (the `packageManager` field of `package.json`; install pnpm
the way your system prefers, for example from pnpm.io). No key, no secret, no cloud access.

```bash
git clone https://github.com/visigain/visigain-frontend.git
cd visigain-frontend
pnpm i
pnpm exec playwright install chromium   # once, for the smoke test
```

The browser install downloads Chromium into Playwright's own cache, once per machine (on Linux, add `--with-deps`
for its system libraries, as CI does).

Two terminals:

```bash
pnpm mock            # the Prism mock of the API on http://127.0.0.1:4010 (from api/openapi.yaml and api/examples)
MOCK=1 pnpm dev      # the app on http://127.0.0.1:3000, with /api/v1/* rewritten to the mock
```

The customer app (visigain-app) runs on port 3002 beside this one, and one mock on 4010 serves both: when visigain-app's
mock already runs, skip `pnpm mock` here (a second one stops with `EADDRINUSE ... 4010`).

On Windows PowerShell, the second is `$env:MOCK="1"; pnpm dev` (`MOCK` then stays set in that terminal). Git Bash takes
the line as written.

The mock's log shows a `NOT_FOUND` error for `exampleKey: <namespace>` (`common`, `site`, `errors` ...) on each wordings call: the
loader first asks for an example named after the namespace, then falls back to the one English export. It is
expected; the page still shows every sentence.

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

Stop `pnpm dev` before `pnpm test:e2e`: Playwright reuses whatever already answers on port 3000 (and a mock on
4010), so with the dev server running the smoke test checks it instead of the build.

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
browser never gets it. When the owner has made the secret `backend-staging-frontend-forward-key`, the same deploy
mounts it as `FRONTEND_FORWARD_KEY`, and this app's server then adds the signed `x-visigain-visitor` header (the
visitor's address, a timestamp and an HMAC-SHA256; `src/api/visitor.ts`) to the calls it makes for a visitor
(`serverApi`), so the backend's per-address limits and its hashed addresses are the visitor's, not this service's. The
address is the `X-Forwarded-For` entry counted from the right by `TRUSTED_PROXY_HOPS` (1 behind Cloud Run alone, 2
behind the load balancer), as the backend reads it. The key is server-only (`tests/client-bundle.test.ts`). To try the
image locally against the mock: `pnpm mock`, then
`docker build -t visigain-frontend . && docker run --rm -p 127.0.0.1:3080:8080 -e MOCK=1 -e MOCK_ORIGIN=http://host.docker.internal:4010 visigain-frontend`
and open http://127.0.0.1:3080/example.

**Next's files are at `/fe/_next/...`** (`assetPrefix`, `src/site/asset-prefix.ts`), in `pnpm dev`, `pnpm start` and
the image alike. At the switch one load balancer serves both apps on visigain.com: `/_next/**` stays with the backend
(its own pages load their files from there) and `/fe/**` comes here. So no page of this app lives under `/fe`, and
every answer carries `x-served-by: frontend` (the switch's checks read it; the backend's says `backend`).

Staging sends no email. The website has no signed-in page (those are visigain-app's, on app-staging). You never get,
need or call production.

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
