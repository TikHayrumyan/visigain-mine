# Contributing

The rules for every change. Backend reviews each pull request against them, and against the checklist GitHub puts in
the description ([`.github/pull_request_template.md`](.github/pull_request_template.md), the same as
[`docs/pr-checklist.md`](docs/pr-checklist.md)).

## 1. Branches and pull requests

1. Never push to `main`; Raf protects it on GitHub. Start every branch from the latest `main`.
2. One branch per change, named for it: `design/tokens`, `page/pricing`, `kit/table`, `fix/theme-switch`.
3. Small pull requests: one kit component, or one page with all its states.
4. Open the pull request into `main` and fill in the checklist. Say why for anything left unticked.
5. CI must be green (`.github/workflows/ci.yml`: install, typecheck, lint, format, unit tests, build, Playwright
   smoke). Run the same on your machine first (README, "The checks").
6. Backend reviews on the day you open it (a late one by the next morning, Los Angeles time). You do not merge your
   own pull request.
7. Commits: "Area: what changed" (for example `Pricing: the offer cards`). LF line endings only (`.gitattributes`).
8. Never `--no-verify`, never a `.env` file in a commit (`.gitignore` keeps them out), never a secret, never a real
   person's or business's data: use invented `*.test` businesses, as the mock does.

## 2. No hard-coded client text

**You never type a word a visitor can read or hear.** Every one comes from the wordings API by key:

```tsx
const t = await getT();                       // src/wordings/server.ts: the approved catalogue, by key
<h1>{t("site.home.get_your_free_grade")}</h1>
<p>{t("dashboard.overview.a_month", { price })}</p>        // {price} filled; numbers formatted for the locale
<li>{t(line)}</li>                                         // a Wording from an API response: a key, or { key, params }
<form aria-label={t("common.theme_toggle.theme")}>...</form>   // attributes too
```

- **Finding a key.** `api/examples/wordings.en.json` is the backend's real approved English export (what the mock
  serves): search it for the sentence the current page shows, and take the key whose namespace and area are your
  page's route. A code drawn as words (a plan, a status, a rank type) takes the key from the spec's `x-wording-keys`
  table, an error from `x-wordings.errors`; never build a key from a code. The rules: [`docs/wordings.md`](docs/wordings.md).
- **The lint fails on literal text in JSX.** `react/jsx-no-literals` (text between tags, a string drawn as a child),
  plus rules for `cond ? "…" : …`, `cond && "…"` and the attributes people read or hear (`aria-label`, `alt`,
  `title`, `placeholder`, `label` …). Only punctuation passes. Never disable the rule, inline or in the config.
- **What is not a wording:** client data (business names, domains, numbers, dates, directory and assistant names) and
  the `ApprovedText` the backend serves already approved (legal bodies, article bodies, FAQ answers, the consent
  lines, engine's report text). Show those as they are. Format numbers, money and dates with `Intl` for the locale;
  prices always come from `GET /api/v1/pricing`, never typed.
- **A missing key is a question for Backend.** It shows as the key in development and with the mock, and as nothing
  in production; a unit test fails on it. Ask Backend in your pull request (the page, the state, the Figma frame,
  where the sentence sits, the sentence Illia proposes), and list the key in `src/wordings/awaiting-backend.ts` until
  the catalogue has it (`tests/wordings-keys.test.ts` keeps that list honest). New sentences go through the
  strategist's draft round, which takes days: ask early, and lay out the page so it works without the sentence.
- **Never copy a sentence from the Figma.** The design's words are placeholders; some look like approved copy and are
  not ([`docs/design-handoff.md`](docs/design-handoff.md), section 5).
- Strings in `.ts` files, text inside an image or SVG, and a sentence passed through a helper are not seen by the
  lint: the rule still applies, by review.

## 3. Accessibility: WCAG 2.2 AA

- Contrast 4.5:1 for text, 3:1 for large text, field borders and the focus ring. Use the token roles; they are
  measured ([`TOKENS.md`](TOKENS.md)).
- Focus always visible (2 px, the text colour, never green); every action reachable by keyboard; no trap.
- One `h1` a page, headings in order, one `main`, every field labelled, every table captioned, live regions for status
  lines, focus moved to the result after a redirect.
- Colour never carries meaning alone (the grid's marks have shapes; a change has a word or a sign).
- Tap targets 44 px on a phone; reduced motion respected (`globals.css` turns animations off for it).
- Check each changed page with axe (the browser extension, or `@axe-core/playwright` in a test) in both themes at
  1440 and 375 px, and say what you checked in the pull request.

## 4. Both themes

Every page exists in light and dark. The theme follows the device unless the visitor chose one (the `vg_theme` cookie,
written by the theme switch in the root layout; the server writes `data-theme` on `<html>`, so there is no flash).
Use the role classes (`bg-bg`, `text-fg`, `bg-surface`, `border-line`, `text-muted` …), never a fixed colour, and
check both themes, and the device's own, for every change. Green and the ink header and footer do not change with the
theme; text on green is always ink.

## 5. Mobile: 375 and 320 px

Check every change at **375 px**, and that it reflows at **320 px** with no sideways scroll (except a table in its own
scrolling box). The smoke test checks 1440 and 375 px; add your page to it when it is the first of its kind.

## 6. The backend's rules a page must keep

The frontend calls only the API. The data, the words, the switches and the legal text come from the backend, and the
backend enforces them; the frontend must not show what they hide:

- **Switches** (`GET /api/v1/site`, read on every render, held 30 s here): `holding` (only `holdingPages` are served;
  the root layout shows the holding page elsewhere), `checkout`, `checkoutWallets`, `aiChat`, `share`, `spanish`,
  and the legal version for the footer and receipts. [`docs/api.md`](docs/api.md), "The switches".
- **States:** a dashboard section draws `view` only when `status` is `ready`; every other status (`locked`,
  `in_grade`, `empty`, `error`, `held`, `unavailable`, `not_in_area`) is designed too.
- **Nothing of the Standard's internals** on any page: no weights, points, check ids, or counts of checks.
- **The pay pages' legal text** stays where the backend puts it: the refund terms above the consent box, the box never
  pre-ticked, the line beside the pay button. The cookie notice's two buttons are equal in size and weight.
- **One green button per view**, no green text, Poppins only, the logo ink or white, a grade letter never without its
  score.
- **No new script, font, style or image host**, and no tag or third-party embed on dashboard, checkout, account or
  report pages.
- **No production**: never point the app, a script or a test at `visigain.com` or a production service. Stripe in
  test mode only, with keys Backend gives you for that task.
