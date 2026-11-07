# Wordings: the keyed catalogue (`GET /api/v1/wordings`)

The separate frontend shows **only text it gets from the API, by key**. It never types a sentence: not a heading,
not a button label, not an alt text, not an error. Every word a client reads is a word the owner (or the strategist,
on his word) has approved, and the approval stays on the server.

- Built by `scripts/catalogue-build.ts` (`pnpm catalogue:build`) into `api/wordings/catalogue.generated.ts`, with every
  key ever given recorded in `api/wordings/catalogue-keys.json`.
- Served by `src/server/wordings/catalogue.ts` `catalogueFor(locale, ns?, env)`, which returns `{ version, entries }`.
  The HTTP route `GET /api/v1/wordings?locale=&ns=` wraps it (Phase 3), with `version` as its ETag.
- `pnpm lint` fails when the generated files are stale (`catalogue-build.ts --check`). The generated file records a
  hash of everything the build reads, so the check returns at once while nothing changed (`--full` builds anyway); and
  `tests/site/catalogue.test.ts` holds the rules below.

## Where the words come from

Nothing is written for the catalogue. It reads the words where pages draw them today, word for word:

| source | what | its state |
| --- | --- | --- |
| `page` | the texts typed into pages and components that the client-text guard's baseline lists (`scripts/client-text-baseline.json`), found with the guard's own parser | approved (the baseline is the approved live text) |
| `t` | the English sentences drawn through `t(...)` (`scripts/client-text-t-keys.json`) | approved |
| `site-copy` | every string of `src/content/site-copy.ts` | approved while `COPY_STATUS` is `APPROVED` and the string is the one `scripts/site-copy-approved.json` records |
| `about-company` | `src/content/about-company.ts` (the /about drafts) | its row's status |
| `registry` | the rows of `docs/product-v2/new-wordings.md` that a page shows (the row names a client route) | its row's status |
| `code` | the live texts pages draw from server code or a `.ts` table (`scripts/catalogue-code.ts` `CODE_SOURCES`: the API's refusals, the plan label, a Move, the statuses, what each plan shows), read from the file's syntax tree word for word, never run | the approval data that holds its words, in order: a registry row, the site copy, a page or `t` text with the same words; else **live**, approved as the client-text guard passes it today (the guard reads only text typed into JSX, never a table's value or server code). `stateFrom` says which |

The Spanish (`es`) comes from `src/content/es`, for an entry whose English it holds. Its state (`esState`) is its own
row's in "The Spanish site".

A row's status is read as the deploy gate reads it (`deploy/config.sh` `wordings_stop`): `draft…` is **draft**, or
**exempt** when the row's first cell names a STAGING ONLY switch production refuses; `replaced…`, `withdrawn…` and
`parked…` are **rejected**; any other status is **approved**, as the gate lets it through.

Not in the catalogue: the Spanish site's rows (they are the `es` of an English entry), the admin's rows, and rows of
emails, PDFs and engine that name no page route. The frontend draws no email.

## What a client is served

| environment | English | Spanish |
| --- | --- | --- |
| production (and any `APP_ENV` but `staging`) | approved entries only | none: the Spanish site is refused in production |
| staging | approved and exempt | only with SPANISH_SITE_ENABLED on: approved and exempt |

Spanish follows the real switch (`src/i18n/locale.ts` `spanishSiteOn`, with its production refusal). A draft or a
rejected text is never served, anywhere, and neither is the `admin` namespace. An entry missing from the Spanish
export falls back to English in the frontend.

## How a key is formed

`<namespace>.<area>.<slug>`, for example `auth.signin.email_me_a_sign_in_link` or `checkout.done.done_title`.

- **namespace**: the route the text is shown on, found by following each page's and layout's imports to the
  components that hold the text: `site` (the public pages, the free scan, shared pages), `dashboard` (`/dashboard`,
  `/monitoring`, `/print`), `checkout`, `account`, `auth` (`/signin`, `/auth`, `/invite`), `errors` (not-found, error
  pages, `/too-many-requests`), and `admin`: text a client component draws only for an admin (under an `admin` or
  `staff` condition, or in an admin's own component such as `PreviewBanner`). `admin` is never served to a client. A text
  shown on routes of more than one namespace is `common` (the root layout, the
  footer, a component the sample report and the dashboard share). Site copy's navigation, footer and legal links are
  `common`; the rest of it is `site`.
- **area**: the route's first part after the namespace (`/dashboard/monitoring/rivals` → `monitoring`;
  `/dashboard` → `overview`; `/` → `home`); for site copy, its export (`home`, `offer`, `faq`). A text in one component
  drawn on several areas takes the component's name (`report_view`), and otherwise `shared`.
- **slug**: the text's first six words, lower case, placeholders and punctuation dropped (`Email me a sign-in link` →
  `email_me_a_sign_in_link`). A registry row with its own key (`` (`done_title`) `` at the end of its first cell) keeps
  that key as its slug.
- **a code text** keeps the key the API names it by (`api/openapi.yaml`), whatever its parts: `errors.cancel_failed`,
  `dashboard.plan_shows.grid.report`. A value the code fills is a `{name}` placeholder named from its expression
  (`up {by}`), or the name the spec's examples already give it. A text whose words the code picks between (a plural, an
  optional clause) is not read: it stays in the spec's `x-wordings.pending`, with why.
- **collisions**: a key that would name two different texts gets a short hash suffix (`_1a2b`), once.
- **stability**: `catalogue-keys.json` maps what an entry is (a page text by its words, a registry row by its section
  and key, a site-copy string by its export and words) to its key. A key, once given, never changes, and a key no
  longer used is kept so it is never given to another text. A text whose words change is a new text with a new key.
  The one move: a text found to be the admin's own is given a new key under `admin`, its old key kept as `retired:`.

**Aliases.** A registry row's own key (`report_price`; scoped as `key@section_slug` when two sections use it), a
site-copy path (`HOME.all.cta`) and `ABOUT_COMPANY.whoTitle` name their entry too: `CATALOGUE_ALIASES`, or
`keyForAlias(alias)`. When a replaced row and its replacement share a key, the key names the approved one.

## Placeholders

A placeholder is kept exactly as the page writes it, and listed in `params`: `%s` (a title template), `{name}` (`t`'s
values) and `[name]` (the registry's values). A value in a template literal, which the guard reads as `{…}`, is named
from its expression in the code (`` `Late by ${days} days` `` → `Late by {days} days`), in the catalogue only; `guard`
keeps the guard's text.
The frontend fills each with the value the API gives it; it never writes words around one.

## Flags worth knowing

- `assembled`: a whole sentence a page builds of pieces in JSX, its words exactly the pieces joined as the page shows
  them, a `{name}` for each value, link or element (`As of {now}.`, `I agree to the {terms_of_service_link} and
  {refund_policy_link}`). `pieces` lists its piece keys; `paramKeys` names the key of a value whose words are an entry
  of their own (a link's label). Its state is the weakest of its pieces'. Its Spanish, when every piece has one, is
  each piece's Spanish in its place.
- `fragment`: a piece of such a sentence. Not a sentence alone: **draw the `assembled` entry instead.** A sentence
  whose words the code picks between (`{weekly ? " Checked every week." : ""}`) is not joined: its pieces stay
  fragments with no template, and Phase 3 asks for a whole sentence through the draft round below.
- `combined`: a registry cell holding several texts as `A / B`, as the registry writes it.
- `notFound`: a baselined text the guard no longer finds on any page.
- `guard`: the text as the guard reads it, where the source writes an HTML entity (`&apos;`); `en` is what the
  browser shows.

## Finding the key of a sentence on a page

1. Search `api/wordings/catalogue.generated.ts` for the sentence's words (it is one entry per line).
2. `from` names the file (or the registry section) it came from; check it is the page you are on.
3. Several matches: take the one whose namespace and area are your page's route; `common.*` is a text several areas
   share.
4. Not there: the sentence is not approved, or the page builds it from pieces. Do not type it. Ask (below).

## Asking for a new sentence

The frontend never types a sentence, even "for now".

1. **Draft.** Ask Backend. The sentence goes into `docs/product-v2/new-wordings.md` as a row (where it shows, the
   sentence, `draft`), never onto a page. `node scripts/wordings-build.mjs`, then `pnpm catalogue:build`: it enters the
   catalogue as `draft`, and no environment serves it.
2. **The strategist** answers the draft round (on Raf's word). It takes days, so ask early.
3. **Approval.** The row's status becomes `approved <date>`; rebuild. The key is served from then on, and the key it
   was given as a draft stays the same.

A draft row also holds the production deploy (the wordings gate), unless it stands behind a STAGING ONLY switch that
production refuses; then it is `exempt` and served on staging only.
