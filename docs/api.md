# The Visigain API (`/api/v1`)

The contract between the new frontend (`visigain/visigain-frontend`) and this backend is
[`api/openapi.yaml`](../../api/openapi.yaml) (OpenAPI 3.1). The spec is the authority: this page explains the rules
around it. The plan is `C:/visigain-handoff/frontend-api-plan-2026-11.md`.

Status (7 November 2026): **the public part is built** (branch night-api3), **auth, the dashboard, reports and
orders** (night-api5), and **checkout and account** (night-api6, the starts behind `API_CHECKOUT_ENABLED`): every
operation answers from the backend, as the spec says, and `tests/api/v1-public.test.ts`, `v1-auth.test.ts`,
`v1-dashboard.test.ts` and `v1-checkout.test.ts` check each live answer against the spec. The current app keeps
working throughout. What building it settled is under "What the implementation settled" below.

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

Under `/api/v1` the 403 is in the error shape below (`cross_site_refused`). Everywhere else the proxy still answers
`{ "error": "cross-site request refused" }`, as the current pages expect.

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
| 409 | the state does not allow it | `no_organisation` (show onboarding), `no_business`, `report_covered`, `already_monitored`, `legal_version_changed`, `pdf_preparing` |
| 410 | gone for good | `report_refunded` |
| 413 | body too large | `too_large` |
| 422 | invalid input; the code names the field | `invalid_email`, `invalid_domain`, `invalid_name`, `invalid_message`, `invalid_category`, `category_unsupported`, `invalid_state`, `consent_required`, `disposable_email`, `form_expired`, `idempotency_key_reused` (a key sent again with another body) |
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

Under `/api/v1` (the public part, as built):
- **The forms keep their limits exactly**, through the same code: `POST /contact` (`submitContact`), `POST /scans`
  (`submitFreeScan`), `POST /consent`, `POST /events`.
- **`POST /scans/confirm/{code}` is new:** 30 an hour per address. The emailed link (a GET of a backend page) has none.
- **The public reads have no limit** (`/site`, `/wordings`, `/pricing`, the legal pages, `/faq`, `/articles`, `/about`,
  `/sample-report`, `/scans/form`, `/scans/{token}`): their 429 is in the spec but never sent today. Until the signed
  visitor-IP header exists, the frontend's server would share one address for every visitor, so a per-address limit on
  a read it makes on every render would refuse everyone at once.
- **`Retry-After`:** the window's own end where the limiter knows it (`/events`, `/scans/confirm`); 3600 for
  `/contact` and `/scans` (their shortest window is an hour, and the code that counts them answers only "limited");
  60 for `/consent`.

**Planned: the signed visitor-IP header** (plan §2.3).
- **The problem:** when the frontend renders a page on its server and calls the API, the backend sees the frontend service's address, not the visitor's. Every visitor would then share one limit, and consent and contact records would hash the wrong address.
- **The fix:** the frontend's server forwards the visitor's address in a header signed with a shared key. The key lives in Secret Manager, for the frontend service only. The API trusts the header only when the signature checks. The header's name and signature format are fixed in Phase 3.
- **Not affected:** browser calls to `/api/v1` go through the load balancer and don't need the header.

## Caching
Every `/api/v1` answer names its own `Cache-Control` (the proxy leaves it to the route there):
- `GET /wordings`: `public, max-age=300, must-revalidate`, with the ETag (304 on a match, the same headers);
- `GET /site`: `public, max-age=60`;
- `GET /scans/form` and `GET /scans/{token}`: `no-store`;
- everything else, errors included: `private, no-store`, as every `/api` answer has always been.

## The holding page and /api/v1
While holding is on (`holding` in `GET /site`), the proxy lets on only what the open pages call (`HOLDING_API_V1` in
`src/server/holding.ts`): `GET /site`, `GET /wordings`, `GET /pricing`, `GET /legal/{slug}` for the five pages by name,
and `POST /contact`. Every other `/api/v1` address answers 404 `not_found`, in the error shape, before routing.
`POST /scans` also answers 404 itself while holding.

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
| `apiCheckout` | `API_CHECKOUT_ENABLED`, effective: with `CHECKOUT_ENABLED` and holding off, always false in production | Whether this API's own starts (`POST /checkout/full-report`, `POST /checkout/monitoring`) start a payment now; false, they answer 503 `checkout_paused`. A frontend on the API shows the paused wording when this is false, even with `checkout` on. |
| `aiChat` | `AI_CHAT_ENABLED` (global; a business may still be off) | Chat comes after launch. Until then, draw nothing. |
| `share` | `SHARE_REPORT_ENABLED` | Off: no "Share this report" on Full Reports. Sharing comes after launch. |
| `spanish` | `SPANISH_SITE_ENABLED`, effective: always off in production while Spanish is not all approved | Off: no `/es` pages and no language switch. On: send `locale=es` to `/wordings`, and to the scan and report calls. Legal bodies stay English. |
| `legalVersion`, `legalVersionNumber`, `legalPageVersions` | `src/content/legal.generated.ts` | Show these in the footer and receipts. Send `legalVersion` with each checkout start: if a newer version came into force meanwhile, the API answers 409 `legal_version_changed`, and the buyer must see the new terms. |

**The API's checkout starts: `API_CHECKOUT_ENABLED`** (staging only, refused in production). `POST /checkout/full-report`
and `POST /checkout/monitoring` answer 503 `checkout_paused` while it is off, as they do with `checkout` off. `/site` reports it
as `apiCheckout` (added 7 November 2026; `checkout` there is still the pages' switch): their 409 `legal_version_changed` names a sentence that is a
proposal (`errors.legal_version_changed`), so the API's starts stay off in production until it is approved. On staging,
deploy with `API_CHECKOUT_ENABLED=true`. Everything else of checkout and account answers whatever it says.

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
  - **catalogue gap**: the sentence is live on today's pages, but built in server code in a way the catalogue cannot
    read as one sentence: the code picks some of its words (a plural, "down" or "up", a clause it adds or leaves out),
    for example the directory count line, a share's move in points and the alert sentences. The texts the build can
    read word for word are served (source `code`, scripts/catalogue-code.ts: the plan label "Free scan", a Move's
    "up {by}", the order statuses, the section header lines, the error sentences).
  - **draft needed**: no approved sentence exists yet, so it goes to the strategist's draft round
    (`errors.legal_version_changed` only, proposed in docs/product-v2/new-wordings.md).
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

## What the implementation settled (the public part, 7 November 2026)
Where the spec left a point open, or was wrong, the built API decided as below. Each change to the spec is additive.

**Settled:**
- **Spanish:** `locale=es` is refused with 422 `invalid_locale` (new code) while `spanish` is off, which it always is in
  production: on `GET /wordings`, `GET /scans/{token}` and `GET /sample-report`. On staging with the switch on, the
  catalogue answers the Spanish entries the gate approves.
- **`checkout` in `/site` is effective:** false while holding too (the pay pages are closed then), and
  `checkoutWallets` is false whenever `checkout` is.
- **The legal page's `effectiveDate`** is the date the page shows (from the deploy for the pages that take it), as
  `YYYY-MM-DD`; `version` is the page's own version line (null for Accessibility); `title` is the footer's key
  (`common.legal_links.terms_of_service` and the others).
- **The contact form's own sentences:** `invalid_email`, `disposable_email` and `rate_limited` on `POST /contact`
  carry `errors.contact.invalid_email`, `errors.contact.disposable_email` and `errors.contact.rate_limited` (a catalogue
  gap: the page's own words, `src/app/(site)/contact/page.tsx`), not the free scan's. A missing name is
  `invalid_name`, a short message `invalid_message`; a body that is not the spec's shape (an unknown field, not
  JSON) is `invalid_state`.
- **The free scan's codes**, in the action's order: `consent_required`, `invalid_email`, `invalid_category`,
  `invalid_state` (the state), `invalid_domain`, `form_expired` (the stamp: missing, forged, too old, used up),
  `disposable_email`, `category_unsupported`, `rate_limited` (429), `scans_paused` (503, an admin paused it),
  `scan_busy` (503, no database connection in time). `ScanRequest` takes an optional `locale` (the Spanish site's
  form). A body over 8,000 bytes is 413.
- **The directory count's lines** are keys: `site.scan.directory_count` with `found`, `total` and `date` (engine's
  reading, ISO), else `site.scan.directory_count.coming_soon` or `site.scan.directory_count.not_in_area`; the hint is
  `site.scan.directory_count.confirm_hint`. All are catalogue gaps (the sentences are live in server code).
- **The grade's average label** is `site.grade.average_label` with `category` and `city`, as engine sends them.
- **`POST /scans/confirm/{code}`:** a signed code confirms (`first` true once); a code whose signature does not check
  answers its own token with `first: false`, as the emailed link still opens the page; a token that is no lead's is 404.
- **Articles:** the cursor is opaque (an offset); a `category` or `tag` that no published article has is ignored, as on
  the page; `seo.noindex` is also true for a sample. The author is the CMS's `AUTHOR`.
- **The pricing fair-use note** fills `site.pricing.limits_unlock`'s `[days]` with the page's own value, "14, 30, 60 and
  90" (`unlockDaysInWords`): English words inside a param, as the page has them today.
- **Errors no route names:** a database with no connection in time is 503 `unknown`, anything else 500 `unknown`
  (`errors.global_error.something_went_wrong_on_our_side`). The spec lists neither status; the client already treats
  them as `unknown`.

**Not served yet (the field is null or left out, never free text):**
- `FreeScanView.comparison` is always null: the city-average lines are built in `src/server/city-averages/wording.ts`
  as whole sentences with no keys and no params. Giving them keys is a catalogue job (the `site.comparison.*` gap).
- `About`: the "What we measure" line (the second sentence of an approved FAQ answer, cut from it on the page) has no
  key of its own, so the `measure` section is not sent. The three new sentences of `/about` are drafts and are left out
  until approved.

**The spec was wrong, and is fixed:**
- `x-wordings.errors` had no code for a refused locale, and gave the contact form the free scan's sentences: added
  `invalid_locale` and the three `@postContact` keys.
- `POST /contact` and `POST /scans` read a body but listed no 413; `POST /scans` listed no 404 (holding);
  `GET /scans/{token}` and `GET /sample-report` take `locale` but listed no 422: each added.
- The free scan's directory count needs its date as a param, and its other lines keys: `site.scan.directory_count`
  takes `[date]`, and the `site.scan.directory_count.*` family is pending.
- `ScanRequest` had no `locale`, so a scan sent from the Spanish site could not ask for Spanish emails: added.
- `Site.checkout` and `checkoutWallets` now say they are effective.

## What the implementation settled (auth, dashboard, reports and orders, 7 November 2026)
**Auth.**
- `POST /auth/verify` signs in through the sign-in page's own code (`src/server/auth/sign-in.ts`, now shared by both):
  the cookie is the pages' (`vg_session`, HttpOnly, SameSite=Lax, Path=/, 30 days, Secure in production), so a session
  from the API and one from the pages are the same session. A link that does not work is 401 `link_invalid`, and so is
  the verify limit's refusal (the limiter answers only "no", as on the page).
- `POST /auth/magic-link` keeps the form's limits; there is no bot check on the sign-in form today, so none here. It
  takes an optional `locale` (the Spanish sign-in page's link), honoured only while `spanish` is on.
- Every signed-in call counts against **120 calls a minute per session** (never per address). `GET /session` too.

**Authorization (every dashboard, report and order route).**
- The organisation is the session user's own membership; `vg_org` only chooses among them; `?b=` only among that
  organisation's businesses. A record by id (`/reports/{id}`, `/reports/{id}/pdf`, `/orders/{id}`) is looked up by its
  own organisation, and the user must be a member of it (the pages' guarded lookups): anything else is 404, the same
  answer, byte for byte, as an id that does not exist.
- `?b=`: a domain that is given and is not one of the organisation's own (another organisation's included) is 404,
  the same bytes as a domain that does not exist, never the caller's own data. Only a missing or empty `b` on the four
  dashboard reads (overview, grid, ranks, citations) is the caller's first business. Where `b` is required (the ticks,
  the grid map) a missing one is 404 too. (Until 7 November the spec said an unknown `b` was the first business; the
  four reads now list 404.)
- A member removed from an organisation reads nothing of it: 404 by id; with no organisation left, the dashboard and
  lists answer 409 `no_organisation`. There is no "view as client": an admin who is no member is treated as anyone else.

**Words.** Each loader sentence is its catalogue key (`src/server/api/v1/wording.ts`). Sent as pending keys, with
their facts as params: `dashboard.alert.<kind>`, `dashboard.ranks.found`, `dashboard.citations.count`,
`dashboard.grid.basis.locations` (and `dashboard.grid.basis.<engine's change_reason>`), `dashboard.comparison.figure`,
`dashboard.comparison.preparing`, `site.scan.directory_count.coming_soon` and `.not_in_area`, `common.customers.<word>`,
`common.customer.<word>`, and in the `dashboard.v2.*` family: `dashboard.v2.reviews.not_available` (`site`),
`dashboard.v2.standard_marker` (`version`), `dashboard.v2.standard_note`, `dashboard.v2.refund.credit_used`
(`usedCents`, `priceCents`) and `dashboard.v2.refund.nothing_back`.

**Other points.**
- An unknown task, or a to-do list that is not tickable (no Monitoring), is 404 on `POST /dashboard/tasks/tick`; the
  quick wins' tick is 404 while `QUICK_WINS_ENABLED` is off, as the action.
- `businessGrades[].latest` is the latest delivered grade or report; a newer weekly check's grade is in `grades`.
- `GET /reports/{id}` keeps the buyer's first opening, and the PDF its audit row, as the pages do.

**The spec was wrong, and is fixed (additively):** the routes that read a body list 413; `switchOrganisation` lists
422; the four dashboard reads list 404 (a `b` that is not the organisation's own); the dashboard reads with `?b=` and `getReport` (its `locale`) list 422; `MagicLinkRequest` takes `locale`.

## What the implementation settled (checkout and account, 7 November 2026)
Built on night-api6: every `checkout` and `account` operation, through the pages' own server code
(`src/server/api/v1/checkout.ts`, `account.ts`), each answer checked against the spec by `tests/api/v1-checkout.test.ts`.

**Settled:**
- **The starts** check, in this order: the session (401), the organisation (409 `no_organisation`), the switches (503
  `checkout_paused`), the Idempotency-Key (422 `invalid_state` when missing or malformed), the body (422; a field's
  code as the page's message: `invalid_domain`, `invalid_category`, `consent_required`, else `invalid_state`), then
  the key's first answer, or the legal version (409 `legal_version_changed`, only when `legalVersion` is sent) and the
  start. The server code's own refusals: `category_unsupported` (422), `report_covered`, `already_monitored` (409),
  `payments_unavailable` (503).
- **The Idempotency-Key** is per person and operation, kept 24 hours (table `api_idempotency_keys`, migration 0111;
  the daily `maintenance.history` pass `apiIdempotencyKeys` deletes the older rows).
  The same key and body give the first answer again with `Idempotent-Replayed: true`, the same key with another body
  **422** `idempotency_key_reused` (the spec said 409; the IETF draft's 422 is used, and the spec now says so). Only a
  success is kept. Two presses with one key are one.
- **Two starts at once** (two keys) make one order or subscription: the checkout hold the pages use.
- **The pay step:** `payment.client` is `{ mode: "fake" }` off Stripe; `clientSecret` is null once nothing is left to
  pay; `kind: "card"` when Monitoring has nothing due today (the card step). `GET /checkout/{id}` gives no pay step
  while payments are paused, and answers the row's own state when Stripe does not answer.
- **`lastError`** is `common.shared.the_payment_did_not_go_through` after a refused try: Stripe's own reason is not a
  wording.
- **The card update** stays open with payments paused (as on /account). A subscription that is not on: 409
  `invalid_state` (the page's sentence for it, "There is no payment method to update", is a catalogue gap); the card
  form unavailable: 503 `payments_unavailable`.
- **Cancel:** "never started" and Stripe not answering are 503 `cancel_failed`, as on the page. `reason` and `detail`
  are kept only while the question's words are approved.
- **Documents:** `what` is `common.monitoring.monitoring_for` or `account.invoices.invoice` for an invoice,
  `account.invoices.full_report` for a receipt; the cursor is opaque (an offset). A receipt's `refund.why` is null
  until the refund sentences have keys (`dashboard.v2.*`).
- **Owner only:** the card update, its finish and cancel answer 403 `owner_only` to a member; another organisation's
  record is 404, as an unknown one.

**The spec was wrong, and is fixed:** `POST /account/payment-method/finish` listed no 409; the Idempotency-Key's
reused-with-another-body answer is 422 (above).

## What the launch list covers
The spec has 47 operations:
- the plan's launch table, with one change: there is no Stripe billing portal, so the card is changed through `POST /account/payment-method` instead;
- 11 operations the pages need that the table didn't list. `tests/api/contract.test.ts` names each one.

The Monitoring sub-pages, fixers, chat, settings, team, sessions, listing, reviews, onboarding, free AI check,
benchmarks, partner and share all come after launch.
