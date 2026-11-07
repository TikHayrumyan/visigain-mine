# Frontend guide: building Illia's design on the API

For the frontend developer. Rewritten for this repository from the backend's developer guides
(`docs/developers/frontend-handoff.md` in visigain-backend, final 6 November 2026). Read with
[`../CONTRIBUTING.md`](../CONTRIBUTING.md) (the rules), [`design-handoff.md`](design-handoff.md) (what the Figma
holds), [`../TOKENS.md`](../TOKENS.md) and [`api.md`](api.md) (the contract's rules).

**What you are building.** Illia's design, approved by Raf, as the new Visigain public website, in this repository
(visigain.com). **The dashboard, checkout and account are not built here:** they are the customer app,
[visigain-app](https://github.com/visigain/visigain-app) (app.visigain.com), with its own README, CONTRIBUTING (the
same rules), page list (`docs/pages.md`) and design notes. The same developer builds both. Backend does not build the design: Backend keeps the API, the data, the switches, the wording catalogue
and the legal text, answers your questions, and reviews every pull request.

**The one boundary: this app calls only the API.** Every page reads `/api/v1/...` (the spec is
[`../api/openapi.yaml`](../api/openapi.yaml)) and draws what it answers. It has no database, no engine access, no
Stripe secret, no email. What does not change with the redesign:

- **the data** a page shows: what the API answers, never computed or invented here;
- **the words**: wording keys into `GET /api/v1/wordings`, or `ApprovedText` shown as it is;
- **the switches** that hide a part: `GET /api/v1/site`, and a section's own `status`;
- **the legal text** and where it sits: `GET /api/v1/legal/*`, `GET /api/v1/checkout/terms`.

If the design needs a new word, a new piece of data or a new state, ask Backend first (section 6).

## 1. Day 1

[`../README.md`](../README.md): `pnpm i`, `pnpm mock`, `MOCK=1 pnpm dev`. The mock serves every launch endpoint with
example data (invented `.test` businesses). Until an endpoint is built behind the spec (Backend's Phase 3, in page
order), the mock is the only place it answers; build against it.

## 2. The API, in short

The full rules are in [`api.md`](api.md); the ones you meet first:

- **Same origin, no CORS.** The browser calls `/api/v1/...` on the page's own origin (`src/api/browser.ts`). A page
  rendering on this app's server uses `serverApi()` (forwards the visitor's cookie) or `publicApi()`
  (`src/api/server.ts`).
- **Errors** are `{ error: { code, message_key } }`; show `t(error.error.message_key)`. The client turns anything else
  (a proxy page, the network) into the generic error key.
- **Session:** the `vg_session` cookie is HttpOnly; this app never reads or writes it. `GET /session` says who is
  signed in. Every non-GET must carry an `Origin` equal to the host (the browser adds it; `serverApi()` sends
  `SITE_ORIGIN`).
- **The business:** dashboard calls take `?b=<domain>`, one of the session organisation's own.
- **Lists that grow** take `cursor` and `limit` and answer `{ items, nextCursor }`.
- **Money** is integer cents (`formatMoney` in `src/lib/money.ts`); dates are ISO 8601, formatted for the locale here.
- **Links, not fetches,** for the report PDF and the grid map: `api.href(...)`, or the URLs the API gives.
- **Checkout** sends an `Idempotency-Key` (`idempotencyKey()`, kept for retries of the same press) and the
  `legalVersion` from `/site`; a `409 legal_version_changed` means the buyer must see the new terms.

## 3. The pages, in order

This repository builds **only the public pages**, at the addresses they have today (they are in printed QR codes and
emails):

| page                         | route here                                                                                      | API                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Home and the public pages    | `/`, `/pricing`, `/faq`, `/contact`, `/articles`, `/articles/[slug]`, `/about`                  | `GET /pricing`, `GET /faq`, `POST /contact`, `GET /articles`, `GET /articles/{slug}`, `GET /about`   |
| The free scan and its result | `/scan`, `/scan/[token]`                                                                        | `GET /scans/form`, `POST /scans`, `GET /scans/{token}`                                               |
| Sample report                | `/sample-report`                                                                                | `GET /sample-report`                                                                                 |
| Legal                        | `/terms`, `/refunds`, `/privacy`, `/cookies`, `/accessibility`, `/privacy-choices`, `/legal/**` | `GET /legal/{slug}`, `GET /legal/lines`, `GET /legal/archive`, `GET /legal/archive/{version}/{slug}` |
| Every page                   | the root layout                                                                                 | `GET /site`, `GET /wordings`, `GET /legal/lines`, `POST /consent`, `POST /events`                    |

Their endpoints are in the spec's `public` tag.

**Not here: the customer app (visigain-app, app.visigain.com).** Sign-in (magic link, Google), the five dashboard
pages, reports and PDFs, checkout ($99 and $149), account, invoices and cancel, and after launch the Monitoring
sub-pages, fixers and chat. Its `docs/pages.md` lists them with their calls. This app links to it in two places:

- **The scan result's buttons.** "Get the Full Report" and "Monitoring" on `/scan/[token]` go to
  `https://app.visigain.com/checkout/...` with the scan token (the entry paths are still to be named in the spec).
- **The "Dashboard" link** in the header shows when the `vg_signed_in=1` hint cookie is present (on `.visigain.com`,
  non-sensitive, readable here) and goes to `https://app.visigain.com/dashboard`. The session cookie is host-only on
  app.visigain.com; this app never sees it and never calls a signed-in endpoint.
- **Both are an `AppLink`** (`src/components/app-link.tsx`), never a hand-written `<a>`: it adds `?vg_ref=<code>`
  when the visitor holds a valid referral code in `vg_ref` on this host (the README, "Every link to the app").

The old addresses on visigain.com (`/dashboard/...`, `/account`, `/signin`, `/auth/verify`, `/checkout/...`) answer
a 308 to the same path on app.visigain.com, set up by Backend on the load balancer.

**Which paths go to the backend on visigain.com.** [`api.md`](api.md), "Paths at the switch", list (a): tokens and
codes in emails (`/scan/confirm/…`, `/invite/…`, `/monitoring/confirm`), `/v/…`, badges and shared links, the PDFs and
images, `/admin/**` (until admin.visigain.com), `/api/**` and the crawler files, plus `/_next/**` (this app's own
files are under `/fe`). Never build a page at one of these. The (b) list in `api.md` still names the dashboard,
checkout and account paths as the frontend's: they are visigain-app's now.

## 4. Things the design must not break

- No word added, cut, shortened or replaced by an icon ([`../CONTRIBUTING.md`](../CONTRIBUTING.md), section 2).
- Nothing of the Standard's internals on any page (weights, points, check ids, a score against a maximum, counts of
  checks). The API does not send them; do not reconstruct them.
- The pay pages' legal text stays where the backend puts it: the refund terms above the consent box, the box never
  pre-ticked, the line beside the pay button. The legal pages' structure does not change.
- The cookie notice's two buttons are equal in size and weight.
- One green button per view, no green text, Poppins only, the logo ink or white.
- A grade letter never without its score.
- No new script, font, style or image host; no tag or third-party embed on dashboard, order, checkout, account or
  report pages. Stripe's Payment Element is the one payment script, in test mode outside production.
- No price typed into a page: `GET /pricing`.

## 5. Tokens and themes

[`../TOKENS.md`](../TOKENS.md): one table (`src/brand/tokens.ts`), one generator (`pnpm tokens`), the open questions
with Illia and Raf, and how a Figma variable becomes a token. Light and dark everywhere; the switch is in the root
layout (`src/components/theme-switch.tsx`, the `vg_theme` cookie, no flash).

**The look today.** The backend's current pages are the reference for what each page and state shows: Backend holds a
picture set of every page, light and dark, desktop and phone, taken on 29 October 2026. Ask Backend for the pictures
of the pages you start; attach your own pictures (the Figma frame beside your page, 1440 and 375, light and dark) to
each pull request. The owner reviews UI changes from pictures.

## 6. Who to ask

Backend (through Raf until a direct channel is agreed). Ask early, in the pull request when you can:

- a wording key the catalogue lacks (CONTRIBUTING.md, section 2);
- data the design shows that the API does not send, or a state with no example in the mock;
- an endpoint that answers differently from the spec (the spec is the authority; one of the two is a bug);
- a test or check that fails and seems wrong.

Questions about the design itself go to Illia through Raf.

**Two product decisions that change what a page may draw (Raf, 6 November 2026).** Connect Google opens with the
Listings module (day 60 of Monitoring, or an admin's early unlock): before then it draws the same locked-module state
as the other modules. While a subscription is paused, re-measures and batch drafts hold; the design needs no new state
for that, and no new sentence.

## 7. Secrets and production

- You never need, see or hold a secret. `.env.example` lists every variable, all blank.
- No production access and no production call: never point the app, a script or a test at `visigain.com` or a
  production service.
- If something seems to need a key, stop and ask Backend.
