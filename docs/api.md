# The Visigain API (`/api/v1`)

The contract between the new frontend (`visigain/visigain-frontend`) and this backend is
[`api/openapi.yaml`](../../api/openapi.yaml) (OpenAPI 3.1). The spec is the authority: this page explains the rules
around it. The plan is `C:/visigain-handoff/frontend-api-plan-2026-11.md`.

Status (6 November 2026): **contract only.** The endpoints are built behind it in Phase 3, in page order. Until an
endpoint is built, the mock answers for it. The current app keeps working throughout.

## Commands

| command | what it does |
|---|---|
| `pnpm api:mock` | Serves the spec on http://127.0.0.1:4010 with its examples (Prism, `--dynamic=false`). |
| `pnpm api:types` | Writes `api/generated/schema.d.ts` from the spec (openapi-typescript). Run it after every spec change and commit the result. |
| `pnpm api:examples` | Rebuilds `api/examples/wordings.en.json` from the real catalogue (`api/wordings/catalogue.generated.ts`, approved only), so the mock's `GET /wordings` serves real approved text. |
| `pnpm api:lint` | Lints the spec with Redocly (`api/redocly.yaml`; no account, telemetry off). It also checks every example against its schema. |
| `pnpm exec vitest run tests/api` | Checks every `$ref` resolves, every launch endpoint is there, and the house rules below hold. |

**The mock:**
- `curl http://127.0.0.1:4010/api/v1/site` returns the first example.
- `-H "Prefer: example=free"` picks a named example. For instance, the overview has `monitoring`, `report` and `free`; the free scan has `running`, `ready` and `failed`.
- `-H "Prefer: code=429"` picks a status.
- `GET /wordings` answers the whole English export (`api/examples/wordings.en.json`) whatever `ns`, `locale` or `If-None-Match` say: Prism can't filter by a query value, and it never answers 304. Filter by namespace yourself against the mock. Headers come from the spec's examples (a fixed ETag, the real Cache-Control values).
- A session call needs a cookie, any value will do: `-H "Cookie: vg_session=mock"`. Without one, the mock answers 401, as the API will.
- From the frontend's dev server, proxy `/api/v1/*` to the mock (a Next.js rewrite). The browser then calls its own origin, exactly as in production.

**The client** (`api/client/index.ts`, typed from `api/generated/schema.d.ts`) has no dependency and no backend import.
Copy the `api/client` and `api/generated` folders into the frontend as they are.

```ts
import { createClient, idempotencyKey } from "./api/client";
const api = createClient({ baseUrl: "" }); // browser: same origin
const { data, error } = await api.GET("/api/v1/dashboard/overview", { params: { query: { b: "sunset-glow-medspa.test" } } });
await api.POST("/api/v1/checkout/full-report", { params: { header: { "Idempotency-Key": idempotencyKey() } }, body: { domain, category, refundConsent: true } });
```

It sends `credentials: "same-origin"`, and the browser adds the `Origin` header by itself. For a call made while rendering
on the frontend's own server, pass `origin: "https://visigain.com"` and `headers: { cookie }` with the visitor's cookie.
`api.href(path, params)` builds a plain link, for the PDF and the grid map.

## Conventions
- **Paths:** every path is `/api/v1/...`, on the site's own domain. There is no CORS: the load balancer sends `/api/*` to the backend.
- **Field names:** the server's own, in camelCase (as in `src/server/**`). The only snake_case names are the fixed ones:
  - `message_key` in errors;
  - engine's week object (`starts_at`, `complete_at`).
- **Money:** integer cents, with `currency: "usd"`. Prices always come from `GET /pricing` (`PRICES`), never typed.
- **Dates:** ISO 8601. Format them for the visitor's locale yourself.
- **The business:** dashboard calls take `?b=<domain>`, which picks among the session organisation's own businesses. The organisation is chosen with `POST /session/organisation`.

## Auth
- **Magic link:**
  1. `POST /auth/magic-link { email, next }` always answers 202. It never says whether the account exists.
  2. The email links to `/auth/verify#token=…`. The token is in the fragment, so no server log sees it.
  3. That page posts `POST /auth/verify { token }`. A GET never signs anyone in, so mail scanners can't use up links.
  4. Links work once and expire in 15 minutes.
  5. Verify sets the `vg_session` cookie and answers `{ redirectTo }`, a same-site path.
- **Session:**
  - `GET /session` always answers 200; `user` is null when signed out.
  - The cookie is `vg_session`: HttpOnly, SameSite=Lax, Secure in production. It lasts 30 days and is renewed when under 15 days are left. Admin sessions are capped at 7 days.
  - The frontend never reads or writes the cookie.
- **Sign out:** `POST /auth/sign-out` answers 204. It ends the session on the server and clears the cookie.
- **Google sign-in stays a backend redirect.** Link or post to `/auth/google?next=…`. Google returns to `/auth/google/callback`, the address registered with Google, which sets the cookie and redirects. Neither is under `/api/v1`, and both stay backend paths for good.
- **2FA** is admin-only (TOTP) and stays in the backend's `/admin`. The client API has none.

## CSRF and Origin
Every non-GET request must carry an `Origin` header equal to the host, or it is refused 403 `cross_site_refused`
**before routing** (`src/proxy.ts`). Same-origin `fetch` from a browser sends the header itself. Only the signed
webhooks are exempt. The load balancer must keep the `Host` (or set `x-forwarded-host`).

> Phase 3: today the proxy answers that 403 with `{ "error": "cross-site request refused" }`. Under `/api/v1` it will
> answer in the error shape below.

## Errors
Every 4xx and 5xx has the same shape:

```json
{ "error": { "code": "rate_limited", "message_key": "errors.too_many_requests.try_again_in_a_little_while" } }
```

`message_key` is the catalogue key of the sentence the page shows for that case today: show its sentence. The
table of every code and its key is `x-wordings.errors` at the top of the spec (one code may have an endpoint's own key,
written `code@operationId`). The client turns an answer that is not this shape (a proxy page, the network) into
`errors.global_error.something_went_wrong_on_our_side`.

| status | when | codes |
|---|---|---|
| 401 | no session, or it ended | `unauthenticated`, `link_invalid` (verify) |
| 403 | Origin check; role | `cross_site_refused`, `owner_only` |
| 404 | unknown, or another organisation's. The two are never told apart: one business can never read another's data | `not_found` |
| 409 | the state does not allow it | `no_organisation` (show onboarding), `no_business`, `report_covered`, `already_monitored`, `legal_version_changed`, `idempotency_key_reused`, `pdf_preparing` |
| 410 | gone for good | `report_refunded` |
| 413 | body too large | `too_large` |
| 422 | invalid input; the code names the field | `invalid_email`, `invalid_domain`, `invalid_name`, `invalid_message`, `invalid_category`, `category_unsupported`, `invalid_state`, `consent_required`, `disposable_email`, `form_expired` |
| 429 | over a limit; `Retry-After` gives the seconds | `rate_limited` |
| 503 | paused by a switch, or a provider did not answer; nothing changed or charged | `checkout_paused`, `scans_paused`, `payments_unavailable`, `cancel_failed` |

## Pagination
Lists that grow take `cursor` and `limit` (1 to 100, default 20) and answer `{ items, nextCursor }`. A null
`nextCursor` means the last page. Cursors are opaque.

The paged lists are:
- `GET /articles`
- `GET /reports`
- `GET /account/invoices`
- `GET /dashboard/grade-history`

Small bounded lists come whole: grid keywords (5 at most), quick wins (3), alerts (5), and a page's own tables.

## Rate limits
These are today's limits, read from the code. Each is a fixed-window counter in Postgres (`src/server/security/rate-limit.ts`).
"Address" means the visitor's IP address, hashed.

| what | limit | where |
|---|---|---|
| magic link request | 5 an hour per email, 20 an hour per address | `src/server/auth/magic-link.ts` |
| magic link verify | 100 an hour per address | `MAGIC_LINK_VERIFY_PER_IP_HOUR` |
| contact form | 5 an hour per address, 3 a day per email | `src/server/contact.ts` |
| free scan | 30 an hour and 200 a day per address; 3 a day per email; 5 a day per site. Staff can change these (`freescan.protection`). The site-wide 150 an hour only alerts, it never refuses | `src/server/freescan/abuse/{limits,settings}.ts` |
| free scan form stamp | at least 3 seconds open and at most a day; each stamp used at most 3 times | `src/server/freescan/abuse/form-guard.ts` |
| consent records | 60 a minute per address (`opt_out` is never refused) | `CONSENT_RECORDS_PER_MINUTE` |
| page-view events | 120 a minute per address; body at most 4,000 bytes | `src/app/api/events/route.ts` |
| guest checkout (staging only, `CHECKOUT_PAY_FIRST`) | 10 an hour per address, 5 an hour per email | `src/server/checkout/pay-first.ts` |

Every operation in the spec lists 429. Session endpoints that have no limit today get a per-session one in Phase 3.

**Planned: the signed visitor-IP header** (plan §2.3).
- **The problem:** when the frontend renders a page on its server and calls the API, the backend sees the frontend service's address, not the visitor's. Every visitor would then share one limit, and consent and contact records would hash the wrong address.
- **The fix:** the frontend's server forwards the visitor's address in a header signed with a shared key. The key lives in Secret Manager, for the frontend service only. The API trusts the header only when the signature checks. The header's name and signature format are fixed in Phase 3.
- **Not affected:** browser calls to `/api/v1` go through the load balancer and don't need the header.

## Versioning
- Everything is under `/api/v1`.
- **v1 only changes by adding:** new endpoints, new optional request fields, new response fields, new enum values (where the description says the list may grow), and new wording keys. The frontend ignores fields it doesn't know.
- **A breaking change means `/api/v2`:** a removed or renamed field, a changed type or meaning, or a new required request field. v1 keeps answering until the frontend has moved.
- Every spec change runs `pnpm api:types`, `pnpm api:lint` and the contract test, and goes through a pull request that Backend reviews.

## The switches (`GET /site`)
Read `/site` on every page render, cached for at most 60 seconds. Only what a page needs is exposed, and the switch
names below are the backend's own (`src/server/config.ts`).

| field | backend switch | what the frontend does |
|---|---|---|
| `holding` | `SITE_HOLDING`, effective: also on whenever production holds for an unapproved wording | Serve only `holdingPages` (`/`, `/pricing`, `/contact`, the legal pages, `/privacy-choices`). Every other path shows the holding page, with the contact link as its only action. Hide the free scan, sign-in and checkout links. Pricing's call to action becomes "write to us" (`site.shared.write_to_us_for_your_free`). The contact form stays open. |
| `checkout` | `CHECKOUT_ENABLED` | Off: show the "payments are paused" wording (`dashboard.shared.payments_are_paused_for_the_moment_2840`) on the buy and Monitoring pages instead of the pay step. The start calls answer 503 `checkout_paused` anyway. |
| `checkoutWallets` | `CHECKOUT_WALLETS` | On: Apple Pay and Google Pay are `"auto"` in the Payment Element. Off: they are `"never"`. Link is always `"never"`. |
| `aiChat` | `AI_CHAT_ENABLED` (global; a business may still be off) | Chat comes after launch. Until then, draw nothing. |
| `share` | `SHARE_REPORT_ENABLED` | Off: no "Share this report" on Full Reports. Sharing comes after launch. |
| `spanish` | `SPANISH_SITE_ENABLED`, effective: always off in production while Spanish is not all approved | Off: no `/es` pages and no language switch. On: send `locale=es` to `/wordings`, and to the scan and report calls. Legal bodies stay English. |
| `legalVersion`, `legalVersionNumber`, `legalPageVersions` | `src/content/legal.generated.ts` | Show these in the footer and receipts. Send `legalVersion` with each checkout start: if a newer version came into force meanwhile, the API answers 409 `legal_version_changed`, and the buyer must see the new terms. |

Other switches never reach the frontend:
- **Off in production:** quick wins (`QUICK_WINS_ENABLED`, staging only) and guest checkout (`CHECKOUT_PAY_FIRST`, refused in production).
- **Shown in the data:** a part that is off arrives as null or as a section with its status.
- **Pricing's Monitoring price:** `GET /pricing` carries `monitoring.priceShown`, from the setting `pricing.monitoring_public`.

## Wordings and the approval gate
- **The frontend never types a sentence.** Every word a client sees comes from `GET /api/v1/wordings?locale=en|es&ns=<namespace>`, which answers `{ locale, version, entries: { [key]: string } }`.
  - `version` is the catalogue's content hash, also sent as the `ETag`. Send `If-None-Match` to get a 304.
  - The namespaces are `site` (public pages), `dashboard`, `checkout`, `account`, `auth`, `common` and `errors`. There is no email namespace: emails stay in the backend.
- **The catalogue holds approved entries only.** The wording gate stays on the server: a draft never leaves it.
- **Sentences in responses:** a field that holds a sentence is a `Wording`, either a key (`"dashboard.dashboard.no_data_yet"`) or `{ key, params }` (`{ "key": "dashboard.shared.of", "params": { "found": 29, "total": 36 } }`). Fill the `[name]` placeholders from `params`, formatting numbers and dates for the locale. Never show a key itself.
- **What is not a wording:**
  - client data: business names, domains, review text, numbers (also formatted ones, such as the percentages in `shareText` and `shareTop3Text`), dates, the weekly slot (`{ weekday, hourLa }`), and the names of directories and assistants;
  - `ApprovedText`, which the backend serves already approved, shown as it is: legal bodies, article bodies, FAQ answers, the consent words (`GET /legal/lines`: the privacy notice, the free scan's boxes, the grade's opinion line; and `GET /checkout/terms`), recorded word for word when ticked, and engine's report text (findings, fixes and their effort words, questions). These are English only.
- **A missing key means ask Backend.** Don't write the sentence. A new sentence goes through the strategist's draft round, which takes days, so ask early.
- **Labels for codes:** an enum whose values are drawn as words carries an `x-wording-keys` table in the spec (value to
  key): the plan, a Move's direction, a section's status, order, subscription, document and invoice statuses, the rank
  types. Use the table; never build a key from a code.
- **Every key the spec names is a real catalogue key** with approved text, except those under `x-wordings.pending`:
  - **catalogue gap**: the sentence is live on today's pages, but built in server code the catalogue doesn't read yet
    (for example the plan label "Free scan", a Move's "up 2", the order statuses, the section header lines). No new
    words are needed; the catalogue build must take them from the source named there, under the key named there.
  - **draft needed**: no approved sentence exists yet, so it goes to the strategist's draft round
    (`errors.legal_version_changed` only).
  Until a pending key is served, the frontend shows nothing in its place and Backend is told. `tests/api/contract.test.ts`
  fails when a pending key becomes real (so the spec moves to it) or when an example names an unknown key.
- **The mock serves the real catalogue:** `api/examples/wordings.en.json` is the English export with the production rule
  (approved only), rebuilt by `pnpm api:examples` (the test fails while it is stale).
- **A section** (`Section`: `feature`, `status`, `view`, `shows`, `unlockedBy`, `weekly`) draws `view` when `status` is `ready`. Otherwise:
  - `locked`: "part of Monitoring" or "part of the Full Report and Monitoring", depending on `unlockedBy`;
  - `in_grade`, `empty`, `error`, `held`, `unavailable`, `not_in_area`: the status's key in `SectionStatus`'s `x-wording-keys` (`empty` has a weekly variant on Monitoring, `in_grade` one per feature).
- **The header line** is the plan's label, then `shows`.

## Paths at the switch: what stays on the backend, what the frontend builds
Plan §2.1. Today every page is served by the backend. When the load balancer (production) or the staging proxy
switches, each path goes to one of two places. The (a) list goes into `raf-commands-frontend-switch.txt`, with a check
for each path. Each path's `/es/...` form follows its English path.

### (a) Backend for good: these can't move
These are tokens and codes in emails and on clients' sites, outside services' callbacks, files, and the backend's own tools.

| group | paths | who links to them |
|---|---|---|
| tokens and codes in emails | `/scan/confirm/[code]`, `/free-ai-check/confirm/[code]`, `/free-ai-check/r/[token]`, `/free-ai-check/s/[token]`, `/monitoring/confirm?token=`, `/invite/[token]` | the free grade, free AI check, monitor recipient and invitation emails |
| unsubscribe and email preferences | `/api/webhooks/unsubscribe/[token]`, `/api/webhooks/email-preferences/[token]`, `/api/webhooks/marketing-unsubscribe/[token]`, `/api/webhooks/review-request-unsubscribe/[token]` | every email's footer (already under `/api/*`) |
| video landing page | `/v/[token]` and everything under it (`/stop`, `/go`, `/media/[kind]`, `/event`) | cold outreach (Instantly) |
| clients' sites and shared links | `/visibility/[token]`, `/visibility/[token]/badge`, `/badge/[domain]`, `/grade/[domain]` (both retired: they answer 404, but old embeds exist), `/r/[code]`, `/r/s/[token]`, `/p/[code]`, `/p/[code]/start` | embed codes; the referral, share and partner links |
| OAuth callbacks | `/auth/google`, `/auth/google/callback` (the address registered with Google); `/dashboard/monitoring/google/start`, `/dashboard/monitoring/google/callback`, `/dashboard/monitoring/google/disconnect` (Connect Google) | Google |
| PDFs and images | `/dashboard/reports/[id]/pdf`, `/dashboard/progress/monthly/[id]/pdf` (the monthly email), `/dashboard/review-card/pdf/[kind]`, `/dashboard/review-card/qr/[format]`, `/dashboard/grid/map`, `/print/**` | dashboard links, the monthly email |
| admin | `/admin/**` | the staff emails |
| API and webhooks | `/api/**` | the frontend, Stripe, Postmark, DocuSeal, engine, Instantly, the scheduler |
| files | `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/articles/feed.xml`, the OG cards (`/benchmarks/**/card`, `/grade/[domain]/card`), `/brand/*` (email logos), and `/_next/static/*` for the pages above | crawlers, social cards, emails |

The frontend's own calls never use the (a) page paths. It uses `/api/v1` (a PDF link is `GET /api/v1/reports/{id}/pdf`, the grid map is `GET /api/v1/dashboard/grid/map`).

### (b) Pages the new frontend builds: they move at the switch
The frontend serves **the same paths**, so emails that link to them keep working.

| path | API calls it uses |
|---|---|
| `/` and the public pages (`/pricing`, `/contact`, `/faq`, `/about`, `/articles`, `/articles/[slug]`, `/sample-report`, `/privacy`, `/cookies`, `/accessibility`, `/privacy-choices`) | `GET /site`, `GET /wordings`, `GET /legal/lines`, `POST /consent`, `POST /events`; then `GET /pricing`, `POST /contact`, `GET /faq`, `GET /about`, `GET /articles`, `GET /articles/{slug}`, `GET /sample-report`, `GET /legal/{slug}` as the page needs |
| `/scan`, `/scan/[token]` | `GET /scans/form`, `POST /scans`; `GET /scans/{token}` (`/scan/confirm/[code]` stays on the backend and redirects here) |
| `/terms`, `/refunds` | `GET /legal/{slug}` |
| `/legal/[slug]` (redirects), `/legal/archive/[version]/[slug]` | `GET /legal/archive`, `GET /legal/archive/{version}/{slug}` |
| `/signin`, `/signin/check-email` | `POST /auth/magic-link`; Google's button links to `/auth/google` (a) |
| `/auth/verify` | `POST /auth/verify` (the token from `#token=`), then go to `redirectTo` |
| `/dashboard` | `GET /session`, `GET /dashboard/overview`, `GET /dashboard/grade-history`, `POST /dashboard/tasks/tick`, `POST /dashboard/quick-wins/tick`, `POST /session/organisation` |
| `/dashboard/grid`, `/dashboard/ranks`, `/dashboard/citations` | `GET /dashboard/grid`, `GET /dashboard/ranks`, `GET /dashboard/citations` |
| `/dashboard/orders`, `/dashboard/orders/[id]`, `/dashboard/reports/[id]` | `GET /reports`, `GET /orders/{id}`, `GET /reports/{id}` |
| `/dashboard/buy` | `GET /checkout/terms`, `POST /checkout/full-report`, `GET /checkout/{id}`, `POST /checkout/{id}/confirm` |
| `/checkout/done` | `GET /checkout/{id}` |
| `/account`, `/account/invoices/[id]` | `GET /account`, `GET /account/invoices`, `GET /account/invoices/{id}`, `POST /account/payment-method` and `/finish`, `POST /account/monitoring/cancel` |
| `/dashboard/monitoring`, `/dashboard/monitoring/pay` | `POST /checkout/monitoring`, `GET /checkout/{id}`, `POST /checkout/{id}/confirm`; **the Monitoring page itself has no launch endpoint** (see below) |
| `/dashboard/progress`, `/dashboard/team`, `/partner`, the other `/dashboard/**` pages | none at launch: the Monitoring sub-pages, team and partner are after launch |

### Every emailed link, checked against the two lists
I read the links built in `src/server/**` (`config().APP_URL` plus a path, and the path constants such as `REPORT_CREDIT_PATH`, `accountUrl` and the series links):
- **in (a):** `/scan/confirm/[code]`, `/free-ai-check/confirm/[code]`, `/monitoring/confirm`, `/invite/[token]`, `/v/[token]` and `/stop`, the four unsubscribe and preference links, `/dashboard/progress/monthly/[id]/pdf`, `/admin/notifications`, `/admin/inbound`, `/admin/outreach`, `/admin/orgs/[id]`, `/admin/limits`, `/admin/providers`, `/brand/*`.
- **in (b):** `/auth/verify` (and `/es/auth/verify`), `/dashboard` (`?b=`), `/dashboard/orders/[id]`, `/dashboard/buy`, `/scan`, `/account`, `/terms`, `/refunds`, `/legal/archive/v[N]/terms`, `/signin?next=`.
- **in (b), but no launch API behind them:** `/dashboard/monitoring` (the subscription-started, report-ready credit, weekly and alert emails, and Stripe's return), `/dashboard/progress` (the weekly letters), `/dashboard/team` (series) and `/partner` (partner approved). At the switch the frontend must serve these paths. Until their endpoints exist (after launch), either the frontend shows a page built from the launch calls, or these paths stay in (a) and go to the backend.
- **in neither:** `/fixes/approve#token=` (`src/server/fixes/approvals.ts`). Nothing sends it yet and no page serves it, so it answers 404 today. When the fixers ship, it belongs in (a).
- **old addresses:** `/med-spas` and `/personal-injury` answer 301 to `/`. The frontend keeps the redirects.

## What the launch list covers
The spec has 47 operations:
- the plan's launch table, with one change: there is no Stripe billing portal, so the card is changed through `POST /account/payment-method` instead;
- 11 operations the pages need that the table didn't list. `tests/api/contract.test.ts` names each one.

The Monitoring sub-pages, fixers, chat, settings, team, sessions, listing, reviews, onboarding, free AI check,
benchmarks, partner and share all come after launch.
