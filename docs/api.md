# The Visigain API (`/api/v1`)

The contract between the new frontend (`visigain/visigain-frontend`) and this backend is
[`api/openapi.yaml`](../../api/openapi.yaml) (OpenAPI 3.1). The spec is the authority: this page explains the rules
around it. The plan is `C:/visigain-handoff/frontend-api-plan-2026-11.md`.

Status (7 November 2026): **the public part is built** (branch night-api3), **auth, the dashboard, reports and
orders** (night-api5), and **checkout and account** (night-api6, the starts behind `API_CHECKOUT_ENABLED`): every
operation answers from the backend, as the spec says, and `tests/api/v1-public.test.ts`, `v1-auth.test.ts`,
`v1-dashboard.test.ts` and `v1-checkout.test.ts` check each live answer against the spec. The current app keeps
working throughout. What building it settled is under "What the implementation settled" below.

Added 8 November 2026 (night-g0, the plan's section 10, groups 0 and 5): every operation tagged `launch` or
`behind-switch` ("Availability" below), `GET /site`'s `switches` and `modules`, and the business extras.

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
| 409 | the state does not allow it | `no_organisation` (show onboarding), `no_business`, `report_covered`, `already_monitored`, `legal_version_changed`, `pdf_preparing`; the fixers: `fixers_hidden`, `fix_refused`, `needs_change`, `module_locked`, `fair_use_reached`, `business_paused` |
| 410 | gone for good | `report_refunded` |
| 413 | body too large | `too_large` |
| 422 | invalid input; the code names the field | `invalid_email`, `invalid_domain`, `invalid_name`, `invalid_message`, `invalid_category`, `category_unsupported`, `invalid_state`, `consent_required`, `disposable_email`, `form_expired`, `idempotency_key_reused` (a key sent again with another body) |
| 429 | over a limit; `Retry-After` gives the seconds | `rate_limited` |
| 503 | paused by a switch, or a provider did not answer; nothing changed or charged | `checkout_paused`, `scans_paused`, `payments_unavailable`, `cancel_failed`, `draft_failed` |

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
| `/api/v1` public reads (only with `FRONTEND_FORWARD_KEY`) | 300 a minute per address, all of them together | `PUBLIC_READS` in `src/server/api/v1/respond.ts` |
| guest checkout (staging only, `CHECKOUT_PAY_FIRST`) | 10 an hour per address, 5 an hour per email | `src/server/checkout/pay-first.ts` |

Every operation in the spec lists 429. Session endpoints that have no limit today get a per-session one in Phase 3.

Under `/api/v1` (the public part, as built):
- **The forms keep their limits exactly**, through the same code: `POST /contact` (`submitContact`), `POST /scans`
  (`submitFreeScan`), `POST /consent`, `POST /events`.
- **`POST /scans/confirm/{code}` is new:** 30 an hour per address. The emailed link (a GET of a backend page) has none.
- **The public reads: 300 a minute per address, all of them together** (`/site`, `/wordings`, `/pricing`, the legal
  pages and `/legal/lines`, `/faq`, `/articles`, `/about`, `/sample-report`, `/scans/form`, `/scans/{token}`;
  `PUBLIC_READS` in `src/server/api/v1/respond.ts`), 429 with the minute's own end as `Retry-After`. **Only while
  `FRONTEND_FORWARD_KEY` is configured:** without it the frontend's server cannot say whose read it makes, and every
  visitor it renders a page for would share its one address, so with no key there is no limit, as before. The address
  is the signed header's when it checks, else the request's own (a browser's read through the load balancer). The
  frontend's own process-wide reads (the switches every 30 seconds, the catalogue re-checked every minute) carry no
  visitor and count against its own address, far below the limit.
- **`Retry-After`:** the window's own end where the limiter knows it (`/events`, `/scans/confirm`); 3600 for
  `/contact` and `/scans` (their shortest window is an hour, and the code that counts them answers only "limited");
  60 for `/consent`.

**The signed visitor-IP header** (plan §2.3; `src/server/security/visitor-header.ts`, the frontend's `src/api/visitor.ts`).
- **The problem:** when the frontend renders a page on its server and calls the API, the backend sees the frontend
  service's address, not the visitor's. Every visitor would then share one limit, and consent and contact records would
  hash the wrong address.
- **The header**, on the frontend server's calls made for a visitor (never on the browser's):

  ```
  x-visigain-visitor: v=1;ip=<the visitor's IP>;ts=<unix seconds>;sig=<base64url HMAC-SHA256, no padding>
  ```

  The HMAC is keyed with `FRONTEND_FORWARD_KEY` over the five lines `v1`, the method in capitals, the path without the
  query string (exactly as sent, e.g. `/api/v1/scans/abc`), the IP and the timestamp, joined by `\n`.
- **Trusted only when** the key is configured (32 characters or more), the signature checks (a constant-time compare),
  the timestamp is within 60 seconds of the backend's clock either way, and the IP is an IPv4 or IPv6 address. Then
  that address is the one `requestMeta` gives `/api/v1` (`metaOf`): its hash on consent and contact records, the free
  scan's and sign-in's rows, and every per-address limit. Anything else (no key, a bad signature, an old or future
  timestamp, another shape) is ignored, and the request is read as before (`TRUSTED_PROXY_HOPS`, `clientIp`). An
  ignored header is logged (`api.v1.visitor_header_ignored`, with its reason) at most once a minute for each reason,
  never with the key, the signature or the address.
- **Which address the frontend forwards:** the entry of the incoming `X-Forwarded-For` that the nearest trusted proxy
  appended, counted from the right by the frontend's own `TRUSTED_PROXY_HOPS`, as `clientIp` does here: 1 on
  frontend-staging (Cloud Run's front end appends the caller's address, the last entry), 2 on frontend-prod behind the
  load balancer (it appends `<client>, <load balancer>`, so the second from the right). The entries before it are the
  client's own and never trusted.
- **The key:** one secret per environment in Secret Manager, read by both services: `backend-staging-frontend-forward-key`
  (staging) and, later, `backend-prod-frontend-forward-key`. 32 random bytes, base64. The owner makes it; nothing in
  this repository creates it:

  ```
  openssl rand -base64 32 | tr -d '\n' | gcloud secrets create backend-staging-frontend-forward-key --project visigain-prod --replication-policy automatic --data-file=-
  gcloud secrets add-iam-policy-binding backend-staging-frontend-forward-key --project visigain-prod --member serviceAccount:backend-staging@visigain-prod.iam.gserviceaccount.com --role roles/secretmanager.secretAccessor
  ```

  backend-staging mounts it as `FRONTEND_FORWARD_KEY` when it exists and its account may read it (`deploy/config.sh`
  `SECRETS_OPTIONAL`, `deploy/03-deploy.sh` `mount_optional`; absent, the deploy goes on without it).
  frontend-staging mounts the same secret as `FRONTEND_FORWARD_KEY` (`deploy/20-frontend-staging.sh` step 5b, which
  grants its account `secretAccessor` on that one secret when it exists), and so does app-staging, the customer app
  (`deploy/23-app-staging.sh` step 5b). Production's frontend (`deploy/21-frontend-prod.sh`)
  does not mount it yet.
- **Not affected:** browser calls to `/api/v1` go through the load balancer and don't need the header.

## Caching
Every `/api/v1` answer names its own `Cache-Control` (the proxy leaves it to the route there):
- `GET /wordings`: `public, max-age=300, must-revalidate`, with the ETag (304 on a match, the same headers);
- `GET /site`: `public, max-age=60` with `Vary: Cookie`; `no-store` when it carries `modules` (a session);
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
Read `/site` on every page render, cached for at most 60 seconds. The fields below came first; `switches` (further down)
lists every client-facing switch. The switch names are the backend's own (`src/server/config.ts`).

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
as `apiCheckout` (added 7 November 2026; `checkout` there is still the pages' switch). The starts no longer wait on any
sentence: their 409 `legal_version_changed` names `errors.legal_version_changed`, approved on 7 November 2026 and served
by `/wordings`. The switch is still refused in production; whether to lift that refusal is Raf's call at the switch. On
staging, deploy with `API_CHECKOUT_ENABLED=true`. Everything else of checkout and account answers whatever it says.

**Every client-facing switch: `switches`** (added 8 November 2026, `src/server/api/v1/switches.ts`). An object keyed
by the backend's own names, each `true` or `false` as the code obeys it now: after `config()`'s production refusals and
each feature's own gate (its drafts rule, holding). The fields above stay, and say the same where they overlap. To show
or hide a page, read its switch here, never a guess. `tests/api/v1-site-businesses.test.ts` checks that every switch
`deploy/config.sh` refuses in production (its "stays false in production" lines and `STAGING_ONLY_SWITCHES`) is
`false` there, with the environment asking for `true`.

| switches | read through |
|---|---|
| `SITE_HOLDING`, `CHECKOUT_ENABLED`, `CHECKOUT_WALLETS`, `API_CHECKOUT_ENABLED`, `SPANISH_SITE_ENABLED`, `SHARE_REPORT_ENABLED` | the same as `holding`, `checkout`, `checkoutWallets`, `apiCheckout`, `spanish`, `share` |
| `CHECKOUT_PAY_FIRST` | `payFirstEnabled` (refused in production) |
| `GOOGLE_SIGNIN_ENABLED` | `googleEnabled`: on only with its credentials |
| `AI_CHAT_ENABLED` | the switch, and the chat's drafts rule (`draftsMayShow`): off in production while a chat sentence is a draft. A business may still be off. |
| `SITE_INDEXABLE` | never while holding (as `robots.ts` and the proxy) |
| `STANDARD_PUBLIC`, `STANDARD_CHANGE_NOTE`, `CITY_AVERAGES_ON_DEMAND`, `ENGINE_SCAN_ANY_CATEGORY`, `REFERRAL_CREDIT_ENABLED` | the setting |
| `FIXERS_ENABLED`, `GOOGLE_CONNECT_ENABLED` | `fixersEnabled`, `googleConnectEnabled` (refused in production) |
| `QUICK_WINS_ENABLED`, `RIVALS_EMAIL_ENABLED`, `PAUSE_SUBSCRIPTION_ENABLED`, `VISIBILITY_BADGE_ENABLED` | the retention pack's gates (refused in production, dark while a sentence is a draft outside staging) |
| `FREE_AI_CHECK_ENABLED`, `PARTNER_PROGRAM_ENABLED`, `BENCHMARK_PAGES_ENABLED`, `BENCHMARK_INDEXING_ENABLED`, `METHODOLOGY_PAGE_ENABLED` | each feature's gate (refused in production) |
| `EMAIL_NURTURE_ENABLED`, `EMAIL_CHECKOUT_REMINDER_ENABLED`, `EMAIL_REPORT_TO_MONITORING_ENABLED`, `EMAIL_ONBOARDING_ENABLED`, `EMAIL_FAILED_PAYMENT_ENABLED`, `EMAIL_WINBACK_ENABLED` | the setting (for the email preferences pages; the emails stay in the backend) |
| `TAG_GA4_ENABLED`, `TAG_CLARITY_ENABLED`, `TAG_META_ENABLED`, `TAG_LINKEDIN_ENABLED`, `TAG_TIKTOK_ENABLED`, `TAG_GOOGLE_ADS_ENABLED` | `tagSwitchOn`, and off while holding (a tag still needs its real id and the consent rules) |

**Left out of `switches`, and why:** none of these changes what a client page shows.
- Plumbing: `PAYMENTS_MODE`, `ENGINE_MODE`, `ENGINE_V2_PARTS`, `EMAIL_PROVIDER`, `EMAIL_SENDING_ENABLED`, `PDF_MODE`, `MONITOR_SCAN_TYPE`, `STRIPE_LIVE_APPROVED`, `STRIPE_ALLOW_RESTRICTED_TEST_KEY`, `INSTANTLY_EVENT_POLLING`, and `VIDEO_PLACEHOLDER` (the `/v/` page stays on the backend).
- Admin and staff tools: `SCORECARD_ENABLED`, `FUNNEL_ANALYTICS_ENABLED`, `OUTREACH_CAMPAIGNS_ENABLED` (on the STAGING ONLY list, but admin only), `ENGINE_COSTS_ENABLED`, `WORDINGS_REWORD`, `CONTACT_NOTIFY_ONLY`, `INBOUND_CRM_PUSH`, `FIX_DRAFTS_BATCH`.
- Server-to-server analytics: `CONVERSIONS_*`, `GA4_MP_*`, `GA4_ANALYTICS_ONLY`.
- The jobs: `RETENTION_*`, `MAINTENANCE_MONEY_PASSES`, `MAINTENANCE_ENGINE_PASSES`, `INTERNAL_OIDC_*`.
- Database switches: each fix module's own is in `modules` (below); the chat's per-business switches are per business; pricing's Monitoring price is `monitoring.priceShown` in `GET /pricing`.

**The 8 modules: `modules`** (added 8 November 2026). With a session cookie, `/site` also gives the fix modules of one
of the session organisation's businesses: `?b=<domain>`, as on the dashboard reads (missing or empty: the first).
Each item has `module`, `unlocked`, `unlockDay` (0, 14, 30, 60 or 90), `daysIn` (days since the live Monitoring
subscription started; null without one), `earlyUnlock` (an admin's) and `on` (`FIXERS_ENABLED` and the module's own
switch). Show a module's page only when it is `on` and `unlocked`. Without a session, for a `b` that isn't one of the
organisation's own, or with no business, there is no `modules`: never another organisation's. With `modules` the
answer is `no-store`; without it, `public, max-age=60` with `Vary: Cookie`. `/site` never answers 401, and is not
counted against the session's limit.

Also:
- **Shown in the data:** a part that is off arrives as null or as a section with its status.
- **Pricing's Monitoring price:** `GET /pricing` carries `monitoring.priceShown`, from the setting `pricing.monitoring_public`.

## Availability: `launch` or `behind-switch`
Every operation in the spec carries `x-visigain-availability`:
- `launch`: it answers in production as it is. Build it in the plan's order.
- `behind-switch`: it answers only while a switch is on. The switch is named in `x-visigain-switch`, by its backend name, and is one of `GET /site`'s `switches`. While it is false, hide the page (the operation answers as its description says, for example 503 `checkout_paused`).

Today only the two checkout starts (`POST /checkout/full-report`, `POST /checkout/monitoring`) are `behind-switch`, on
`API_CHECKOUT_ENABLED`. Two checks hold it: `pnpm api:lint` (the Redocly rules `rule/operation-availability` and
`rule/behind-switch-names-its-switch` in `api/redocly.yaml`), and `tests/api/contract.test.ts`, which also pins the
list of operations behind a switch and checks each names a switch of `/site`. A new operation without the tag fails both.

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
  - **catalogue gap**: the sentence is live on today's pages, but built in server code the catalogue does not read
    yet. None is left: the texts built in code are served (source `code`, scripts/catalogue-code.ts), and so is each
    form of a sentence whose words the code picks (below).
  - **draft needed**: no approved sentence exists yet. None is left: the last one, `errors.legal_version_changed`, was
    approved on 7 November 2026, so `x-wordings.pending` is empty.
- **Forms.** A sentence the code builds with a plural or an optional clause has one key per form the code produces,
  each with the code's exact words and `{name}` placeholders: `.one` and `.other` for a plural
  (`site.scan.directory_count.one`: "... of the {total} directory we check ..."), `.with_clause` and `.without_clause`
  for an optional clause, and the choices joined where there are several (`dashboard.grid.basis.checked_other.unread_none.miles_other.found_other`).
  The API sends the key of the form the code picked, with params; fill it as any other key. Numbers come as numbers
  (an average or a score is written with one decimal, a move in the Standard's note with its sign, cents as money) and
  days as ISO dates, formatted by the frontend as the pages write them.
- **Engine's words for a business's customers** ("customers", "clients", "patients") are engine's data, not wordings:
  `categoryWords: { customers, customer }`, plain strings, put into the [customers] and [customer] sentences as they
  are. `words` keeps the rest (`storefront`, `held`, `audience`).
  - **draft needed**: no approved sentence exists yet, so it goes to the strategist's draft round (none today).
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
The same list is code in `deploy/backend-paths.mjs` (the staging proxy's one-origin mode routes by it, and production's load balancer does: `deploy/frontend-switch-map.mjs` writes the URL map of `deploy/22-frontend-switch.sh` from it, with `/_next/**` on the backend, as the frontend's own files are at `/fe/_next/**`); `tests/deploy/staging-proxy-one-origin.test.ts` holds the two together, so change both at once.

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

### The three hosts (APP_ORIGIN, ADMIN_ORIGIN)
The final shape (`C:/visigain-handoff/frontend-api-plan-2026-11.md`, section 9) puts the website on `visigain.com`
(`APP_URL`), the app on `app.visigain.com` (`APP_ORIGIN`) and the admin on `admin.visigain.com` (`ADMIN_ORIGIN`). The
paths of each are written once, in `deploy/host-paths.mjs`; `src/server/hosts.ts` builds every link from it, `src/proxy.ts`
redirects by it, and `deploy/frontend-switch-map.mjs hosts` writes the load balancer's map from it. **While both settings
are unset nothing moves:** one host, every link on `APP_URL`, no redirect (the one-app launch).
- **Links** (emails, the magic link, Stripe's return addresses, Google sign-in's and Connect Google's redirect URIs, the
  PDF links): the dashboard, reports, orders, checkout, account, invoices, sign-in and verify go to `APP_ORIGIN`; the
  admin's to `ADMIN_ORIGIN`; the free scan, a shared report, legal, unsubscribe and the other (a) token links, and the
  logos, stay on `APP_URL`. `tests/email/link-hosts.test.ts` lists every email's links and their host.
- **Old links:** with `APP_ORIGIN` set, a GET or HEAD on another host of `/dashboard/**`, `/account/**`, `/signin`,
  `/signin/check-email`, `/auth/verify` and `/checkout/**` answers 308 to the same path and query on `APP_ORIGIN`
  (`APP_REDIRECT_PATHS`). With `ADMIN_ORIGIN` set, a GET of `/admin/**` elsewhere is a 308 there; anything else under
  `/admin` or `/api/admin` elsewhere is 404. The admin's host serves its own sign-in pages.
- **Load balancer** (stage `hosts`): `visigain.com` sends list (a), `/_next/**` and the old app paths above (so the
  backend can 308 them) to `backend-prod`, the rest to `frontend-prod`; `app.visigain.com` sends `/api/v1/**`, the
  OAuth callbacks and the PDF and image routes (`APP_HOST_BACKEND_PATTERNS` in `deploy/backend-paths.mjs`) to
  `backend-prod`, the rest to `app-prod`; `admin.visigain.com` sends everything to `backend-prod`.
- **Cookies:** the session stays host-only. With `APP_ORIGIN` set, sign-in also writes `vg_signed_in=1` on the parent
  domain (`.visigain.com`; none on run.app, localhost or an IP), cleared at sign-out: no identity, for the website's
  "Dashboard" link (`src/server/auth/signed-in-hint.ts`). Its Cookie Policy line is pending (`policyPending` in
  `src/config/cookies.ts`).

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
- **The directory count's lines** are keys: `site.scan.directory_count.one` or `.other` (the plural of "directory")
  with `found`, `total` and `date` (engine's reading, ISO), else `site.scan.directory_count.coming_soon` or
  `site.scan.directory_count.not_in_area`; the hint is `site.scan.directory_count.confirm_hint`.
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
- The free scan's directory count needs its date as a param, and its other lines keys: `site.scan.directory_count.one`
  and `.other` take `{date}`, and its other lines are `site.scan.directory_count.*`.
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

**Words.** Each loader sentence is its catalogue key (`src/server/api/v1/wording.ts`). The built ones are the key of
the form the code picked (see Forms), with their facts as params:
- `dashboard.alert.<kind>.<form>`: `low_review.posted`, `.no_reply` and `.no_reply_caution` (`stars`, `date`,
  `checked`); `overtaken` (`name`, `keyword`, `date`, `since`, the four ranks, one decimal); `ai_dropped.with_mark` and
  `.without_mark` (`assistant`, `question`, `monday`: the week before's Monday, `date`); `duplicate.with_name` and
  `.without_name` (`name`, `date`, `since`); `listing_changed.<hours|phone|website>.plain`, `.hours.days` (`days`: the
  listing page's own lines for the days that changed, data) and `.<phone|website>.now_was` (`now`, `was`).
- `dashboard.ranks.found.<down|up>.<one|other>` (`ranked`, `keywords`, `before`); `dashboard.citations.count.<one|other>`
  (`found`, `total`, `date`); `dashboard.grid.basis.<checked>.<unread>.<miles>.<found>` (`checked`, `unread`,
  `spacing`, `found`). `GridNumbers.changeReason` is engine's code (data): no sentence is drawn for it.
- `dashboard.comparison.figure.with_clause` ("(you are below it)") and `.without_clause` (`label`, `score`);
  `dashboard.comparison.preparing.one` and `.other` (`hours`).
- The AI share's move: `share.text`, `common.move.points.<better|worse>.<one|other>` (`by`).
- `dashboard.v2.standard_marker` (`version`); `dashboard.v2.standard_note.changed` (`version`, `score`, `grade`,
  `scoreBefore`, `change`) and `.letter` (`grade`, `gradeBefore`); `dashboard.v2.refund.credit_used.with_clause`
  (`usedCents`, `priceCents`) and `dashboard.v2.refund.nothing_back`.
- A review site not read yet is `{ site, label }`: its name and the "Not available yet" label's key.

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
  `account.invoices.full_report` for a receipt; the cursor is opaque (an offset). A receipt's `refund.why` is the
  refund's sentence for a refund of less than the price (`dashboard.v2.refund.*`), null otherwise.
- **Owner only:** the card update, its finish and cancel answer 403 `owner_only` to a member; another organisation's
  record is 404, as an unknown one.

**The spec was wrong, and is fixed:** `POST /account/payment-method/finish` listed no 409; the Idempotency-Key's
reused-with-another-body answer is 422 (above).

## Business extras (the plan's section 10, group 5; 8 November 2026)
Built on night-g0 (`src/server/api/v1/businesses.ts`), checked by `tests/api/v1-site-businesses.test.ts`.
- **Switch business:** `?b=<domain>` on the dashboard reads, as before.
- **Add a business: `POST /organisations`.** The app has no form that adds a business's website on its own. Its
  "Add another business or agency" (`dashboard.settings.add_another_business_or_agency`) opens the onboarding form,
  which makes an **organisation** (a business or an agency), with the caller as owner, and chooses it (`vg_org`). So
  that is what this call wraps (`createOrg`): the same steps, the free grades of the caller's email claimed into it,
  a referral code kept (only with `REFERRAL_CREDIT_ENABLED`). A website joins an organisation with a Full Report or
  Monitoring start, or a claimed free grade, as on the pages. The form's words are
  `dashboard.onboarding.tell_us_about_your_business`, `dashboard.onboarding.business_or_agency_name`,
  `dashboard.onboarding.this_account_is_for`, `dashboard.onboarding.my_own_business` and
  `dashboard.onboarding.an_agency_with_several_businesses`. A name that isn't right is 422 `invalid_business_name`,
  the page's own sentence (`errors.invalid_business_name`, read from the form's code since the integration); another
  field that isn't right, `invalid_state`.
  This is also group 4's "onboarding".
- **`GET /businesses`:** the session organisation's businesses with their plans, Monitoring first (the switch's list).
- **`GET /businesses/{id}/scans`:** one business's delivered grades and reports, newest first, paged: the grade
  history for that business only. Another organisation's id is the same 404 as an unknown one.

## What the implementation settled (settings and account extras, group 4, 8 November 2026)
Built on night-g4: tag `settings`, 26 operations through the pages' own server code (`src/server/api/v1/settings.ts`),
each answer checked against the spec by `tests/api/v1-settings.test.ts`.

**Settled:**
- **Which page each wraps:** /dashboard/settings (`GET /settings`, rename, do-not-sell, delete), /account's language
  (`POST /settings/language`, SPANISH_SITE_ENABLED), /dashboard/team, /dashboard/sessions, the "Connect Google" card
  (`GET /monitoring/google`, `POST /monitoring/google/start`), /dashboard/progress, /dashboard/share, a Full Report's
  "Share this report" box (`/reports/{id}/share-links`, `/share-links/{id}/revoke`, SHARE_REPORT_ENABLED),
  /dashboard/visibility-badge (VISIBILITY_BADGE_ENABLED) and /dashboard/onboarding (its form is `POST /organisations`).
- **Stays on the backend:** "Download my data" (`exportPath`, /api/account/export), the monthly and report PDFs
  (`pdfPath`), the invite accept page /invite/{token}, Google's callback and the disconnect.
- **Switches:** a read behind an off switch answers `{ availability: "hidden", reason: "off" }`; a change answers 404.
  The badge's opt-out works with the switch off, as the page's (a client can always leave).
- **Codes:** another organisation's member, invitation, report, link or business is 404; a member on an owner's step
  403 `owner_only`; the last owner 409 `last_owner`; delete by the last owner of a team 409 `owner_first`; the badge
  without its box 422 `consent_required`, without Monitoring 409 `needs_monitoring`. Each with the page's own
  sentence (`x-wordings.errors`, `code@operationId`).
- **Words:** the pages' alerts and refusals that were drawn from server code now have keys read from that code
  (scripts/catalogue-code.ts, no new words): `errors.only_an_owner`, `errors.last_owner`,
  `dashboard.team.invalid_email`, `dashboard.team.ok.invited` and the other three, `dashboard.settings.name_too_short`,
  `dashboard.settings.error.confirm_delete`, `dashboard.settings.error.owner_first`, `dashboard.share.owner_only`,
  `dashboard.share.ok.code_created`, `account.language.saved`, and the device line `dashboard.sessions.device.line`
  with `dashboard.sessions.device.any_browser`, `dashboard.sessions.device.any_system`, `dashboard.sessions.device.unknown`.
  A session's device is its product names; a task's mark is its state and day (`dashboard.dashboard.verified_by_scan_on`
  and its two siblings); the weekly slot is numbers.
- **The invitation** takes an Idempotency-Key, as the checkout starts: a retry sends no second email.

## "Ask about your report" (the chat, group 3, 8 November 2026)
Six operations under tag `chat`, each `behind-switch` with `x-visigain-switch: AI_CHAT_ENABLED` (and the admin's
database switches: the global `assist.chat_global` and the business's own, Admin › AI chat). They wrap the panel's own
server code (`src/server/api/v1/chat.ts` over `src/server/assist`); `tests/api/v1-chat.test.ts` checks every answer.

- **Nothing of the chat moves to the frontend.** Every guard before and after the model, every fixed reply, the masking,
  the hourly bound (30 a business), one question at a time per business and engine's US$3 cap run in `askChat`, as for
  the panel; the test asks the same questions through the panel's action and the API and gets the same kind, verdicts
  and words. What the API returns is the stored, masked row: never a model reply the guards blocked.
- **Words:** our own sentences by key: the panel's chrome (`GET /chat` `words`, `dashboard.chat.*`), the allowance and
  the limit (`dashboard.chat.allowance`, `dashboard.chat.limit`, with `percent` and `date` as params), and an answer that
  is one of the fixed replies (`wording`, a `dashboard.chat_reply.*` key such as `dashboard.chat_reply.advice`; `text`
  is then null). Any other answer is `text`: the model's words or a fixed answer from the client's own report, after
  the guards; show `dashboard.chat.ai_label` with it.
- **Hidden:** `{ availability: "hidden", reason }` (200) wherever the panel is not drawn: `off` (a switch),
  `not_monitoring`, or `paused` (Raf's rule: no chat while paused; show `dashboard.chat.off`). A send that is hidden asks
  nothing and keeps nothing for its key. `GET /chat` `off: true` is the admin's switch-off for the subscriber.
- **The answer, inside its own request.** `POST /chat/messages?b=` (Idempotency-Key) waits for the whole answer, as the
  panel's action does: no answer is worked on after its request has ended (Cloud Run gives CPU only during requests).
  The wait is the panel's model deadline (`QUESTION_DEADLINE_MS`, 120 seconds, after which the pipeline answers the
  fallback) and 5 seconds for the stores; a question still out then is marked `failed` (the panel's error line), and
  its poll says `failed` too, never `pending` for ever. Note: the request must be allowed to stay open that long (the
  backend service's 60-second request timeout, and the load balancer's, cap the panel's action in the same way).
- **A page reloaded mid-answer:** send the same press again (the same Idempotency-Key and body, kept in
  sessionStorage). It is never asked twice: the replay answers the question's state, or 202 `pending` with its id when
  another instance is answering it. Then `GET /chat/messages/{id}` every 1 or 2 seconds: 202 `pending`, then 200 `done`
  (or `refused` / `failed`, with the panel's sentence). It reads the row; nothing is worked on there. Polling works alone.
- **Server-sent events (optional):** the same `GET /chat/messages/{id}` with `Accept: text/event-stream` streams `event:
  state` blocks (the poll's JSON) until the state settles or 25 seconds pass, under the load balancer's 30-second
  backend timeout. It works through the route handlers (`Cache-Control: no-store, no-transform`, so the server's
  compression does not hold it back; tested in Vitest); it is not yet tried through Cloud Run and the load balancer.
  **The fallback is polling:** a client that sees no event within a few seconds, or a stream that ends before `done`,
  polls the same URL.
- **A question whose process died** (its POST never came back) reads `failed` once the POST's wait has passed.
- **History** (`GET /chat/messages?b=`): newest first, `limit` up to 40, opaque cursor; only text a client may still
  read: 90 days, a health or legal question and its answer 30, no deleted text, never a patient's details (not stored),
  even before the daily retention pass. A done question's `question` is null for the same reason.
- **Kept for the poll:** table `api_chat_asks` (migration 0112): where a question stands, never its text; deleted after
  24 hours by the daily `maintenance.history` pass `apiChatAsks`. The Idempotency-Key keeps the id alone.
- **Thumbs** (`POST /chat/messages/{id}/thumbs`, 1, -1 or 0) and **report a problem** (`.../problem`, 204; masked, 20
  an hour a person, then 429). A question's id, another organisation's answer and an unknown id are 404 alike.

## What the implementation settled (fixers, 8 November 2026)
Built on night-g2 (the full-API add-on, group 2): the `fixers` tag, 11 operations, each `behind-switch` with
`x-visigain-switch: FIXERS_ENABLED` and `x-visigain-module-switch: fixers.module.<module>`
(`src/server/api/v1/fixers.ts`; `tests/api/v1-fixers.test.ts` checks every answer against the spec).

- **Through the pages' own code.** The steps go through `ownerReviewAction` (Reviews) and `ownerPageAction` (Pages),
  a draft through `draftPage`: the lint, the state machine, the roles and the month's limit are theirs. Only those
  two kinds of fix have steps here; any other kind is decided by the emailed link only (409 `fix_refused`, and
  `steps` all false), except AI Fact Check's below.
- **AI Fact Check's two buttons** (added at the integration, night-int1): `POST /fixers/facts/updated` ("I've updated
  it") and `POST /fixers/facts/not-needed` ("Not needed"), `?b=<domain>`, body `{ row }`: the row's key from
  `GET /monitoring/watch` (`facts.rows[].key`), not a fix id, because the page makes the row's fix at the owner's click.
  Through `ownerFactAction` (the row read again from engine; owners only). With the Idempotency-Key. 409
  `module_locked` before day 14 (nothing made: a fix would open the module early), `fix_refused` when the row is gone
  or already decided, `fixers_hidden` when off; 403 `owner_only` for a member.
- **Hidden.** FIXERS_ENABLED off (always in production), the module's switch off, a business not on Monitoring or of
  a category with no fixer: a read answers `{ hidden: true, reason }` (200), a step 409 `fixers_hidden`. The app hides
  the page.
- **Steps** need the Idempotency-Key, as the checkout starts (`{}` is the body of reject and the posted step).
  Editing is open to a member; approving, rejecting, the posted step and a draft need an owner (403 `owner_only`).
  `steps` in every fix says which the caller may take now.
- **The re-measure** starts with the posted step (`POST .../published`: the pages' "I posted it" and "I published
  it"). A pause holds it as built: the step is taken, the state says `paused`, and engine is asked nothing until the
  pause ends. Approving, and the emailed link `/fixes/approve#token=` (a backend route, list (a)), are not held.
- **The unlock days:** each module's `unlocked`, `unlockDay` and `early`; a draft asked for in a locked module is 409
  `module_locked` (`dashboard.monitoring.state_coming`).
- **Fair use:** `GET /fixers/fair-use`, used and left per limit; the chat's figure is `enforced: false`.
- **Words:** no new sentence. Errors use the pages' own keys (`dashboard.monitoring.refused`,
  `dashboard.monitoring.needs_change`, `dashboard.monitoring.cap_flash`, `dashboard.monitoring.draft_failed`); the
  lint's hints are the modules' approved hints as keys. `business_paused` borrows
  `account.pause_monitoring.while_it_is_paused_there_are` until the strategist writes the draft's own line.
- **Not here:** the page builders' offers (the brief ids a draft is asked for) and the review queue's own view are
  the Monitoring group's read-only views.

## What the implementation settled (Monitoring, group 1 part B, 7 November 2026)
Built on night-g1b (`src/server/api/v1/monitoring-b.ts`, tests in `tests/api/v1-monitoring-b.test.ts`). Each path is
its page's address without `/dashboard` (the review card and the two read pages keep it, as the other dashboard reads).

| operation | page | availability |
|---|---|---|
| `GET /dashboard/reviews` | /dashboard/reviews | launch |
| `GET /dashboard/listing` | /dashboard/listing | launch |
| `GET /dashboard/review-card` | /dashboard/review-card (its QR and PDF routes stay on the backend: links) | launch |
| `GET /monitoring/ask-for-reviews`, `POST /monitoring/ask-for-reviews/send` | /dashboard/monitoring/ask-for-reviews | behind-switch: FIXERS_ENABLED and `fixers.module.reviews` |
| `GET /monitoring/reviews` | /dashboard/monitoring/reviews | behind-switch: FIXERS_ENABLED and `fixers.module.reviews` |
| `GET /monitoring/pages` | /dashboard/monitoring/pages | behind-switch: FIXERS_ENABLED and `fixers.module.pages` (day 30) |
| `GET /monitoring/watch` | /dashboard/monitoring/watch (AI Fact Check, Profile Guardian, holidays): part A's route (`getMonitoringWatch`, `src/server/api/v1/monitoring.ts`), kept at the merge | behind-switch: FIXERS_ENABLED |

- **Hidden and locked.** Where a fixer page answers "not found" today (a switch off, always in production; no
  Monitoring; a category not offered the tool), the API answers 200 `{ state: "hidden", modules, reason }`. A module
  not unlocked yet is `{ state: "locked", module, name, about, coming }`, the page's `ModuleLocked` (never a date). A
  `b` that is not the organisation's own is 404 first, as every dashboard read.
- **The send** is the action's `sendReviewRequests`: hidden is 404 (nothing read or written), a member who is not an
  owner 403 `owner_only`; the form's refusals are 200 `sent: false` with the page's own lines. A CSV file is sent as
  its text in `list`.
- **Words.** A sentence from a word table (`src/server/fixes/*/wording.ts`) is its catalogue key, found by its words.
  New keyed templates from existing approved words (scripts/catalogue-code.ts): `dashboard.ask_for_reviews.email_*`
  (the email preview and the default paragraph), `dashboard.watch.fix_*` and `dashboard.watch.detail_*` (AI Fact
  Check's step; its `[detail]` and `[stated]` params are keys), `dashboard.review_card.sheet_<size>.title` and `.note`.
  The email a client copies from the review card is `email`: `dashboard.review_card.email.subject`, then `opening`
  (`greeting`, `thanks`, `ask`), the link, and `closing` (`sign_off`, `team`), [business] the business's name.
- **Not here (the fixers' API, group 2):** the review reply's Save, Approve, Reject and "I posted it"; a page's "Write
  a draft", Save, Approve, Reject and "I published it"; AI Fact Check's "I've updated it" and "Not needed"; the flash
  lines those answer with.
- **Pay and cancel.** /dashboard/monitoring/pay is `GET /checkout/{id}` and `POST /checkout/{id}/confirm` with the
  subscription's id; /dashboard/monitoring/cancel (a redirect to /account) is `POST /account/monitoring/cancel`. No new
  route. The listing builder (F5) is not built (engine's `listing-targets` answers `built: false`): no page, no route.

## What the launch list covers
The spec has 132 operations:
- the plan's launch table, with one change: there is no Stripe billing portal, so the card is changed through `POST /account/payment-method` instead;
- 11 operations the pages need that the table didn't list. `tests/api/contract.test.ts` names each one;
- the 3 business extras above (section 10, group 5);
- Monitoring (section 10, group 1): 10 in part A and 7 in part B;
- the 11 fixers' operations (group 2, with AI Fact Check's two steps);
- the chat's 6 (group 3);
- settings and account extras, 26 (group 4);
- the 22 features built on staging (group 6, below).

Every customer-facing page of section 10 now has its operations.

## The features built on staging (group 6, 8 November 2026)
Each behind its own switch and refused in production, as its pages are; off, every operation is 404 `not_found` (hide
the page). Tagged `x-visigain-availability: behind-switch` with `x-visigain-switch`.

- **Free AI check** (FREE_AI_CHECK_ENABLED): `GET /free-ai-check/form`, `POST /free-ai-check`,
  `GET /free-ai-check/results/{token}`, `POST .../detail`, `POST .../next`, `POST` and `DELETE .../share`,
  `GET` and `POST /free-ai-check/confirm/{code}`, `GET /free-ai-check/shared/{token}`. No session: the key is the
  check's. Each refusal is the page's own alert (its code's key in `x-wordings.errors`).
- **Partner program** (PARTNER_PROGRAM_ENABLED): `GET /partner` (the page, or the application when `state` is `none`),
  `POST /partner/apply`, `POST /partner/logo` (PNG in base64), `GET /p/{code}`, `GET /p/{code}/start`. Exactly what the
  pages show: tax forms, rates and payouts stay the admin's.
- **Pause** (PAUSE_SUBSCRIPTION_ENABLED): `GET` and `POST /account/pause-monitoring` (owners, their own subscription;
  one pause in 180 days).
- **Benchmarks** (BENCHMARK_PAGES_ENABLED; `indexable` follows BENCHMARK_INDEXING_ENABLED) and **/how-we-grade**
  (METHODOLOGY_PAGE_ENABLED): `GET /benchmarks`, `/benchmarks/{slug}`, `/benchmarks/ai-visibility-index`,
  `/benchmarks/ai-visibility-index/{place}/{month}`, `/how-we-grade`. The card images stay backend routes (`cardPath`).
- **The grade badge** is night-g4's (`/visibility-badge`); the public `/visibility/{token}` page stays a backend route.
- The signed-in steps (apply, logo, pause) ask for an `Idempotency-Key`. The free AI check's public steps are bounded
  by their own rules instead (one check reused, the email capped, one share link per check) and a per-address limit.

**Spanish, endpoint by endpoint.** Sentences are keys: their Spanish is `GET /wordings?locale=es` (the gate: approved,
and on staging the exempt rows), only while `spanish` is on; `locale=es` elsewhere is 422 `invalid_locale`.
| endpoint | text it returns | Spanish |
|---|---|---|
| `/wordings` | the catalogue | yes (now with the chat's fixed replies and their Spanish) |
| `/faq`, `/pricing` | approved FAQ text as it is | yes, `locale=es`: each item in Spanish where approved (`locale` per item); the CMS's own FAQ stays English |
| `/legal/*`, `/legal/lines`, `/checkout/terms` | legal text, word for word | no: legal stays English (recorded as agreed) |
| `/articles`, `/articles/{slug}` | CMS articles | no: English only, no Spanish page |
| `/scans/{token}`, `/sample-report`, `/reports/{id}` | keys, engine's text | keys yes; engine's sentences stay English |
| dashboard, account, checkout, orders, `/about`, `/site` | keys only | yes, through `/wordings` |
| group 6 (free AI check, partner, pause, benchmarks, how-we-grade) | keys; names, questions and findings as data | keys yes; data as typed or as engine wrote it |
| chat (group 3) | fixed replies by key, model answers | fixed replies yes (catalogue es); model answers in the client's language |
| grade badge (night-g4) | keys, the paste code | keys yes; the badge image and its alt stay English, as the page |
