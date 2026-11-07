# Pull request checklist

For every pull request. The same list is the pull request template
([`../.github/pull_request_template.md`](../.github/pull_request_template.md)); Backend reviews against it and writes
the result in the pull request. Rewritten for this repository from the backend's `frontend-pr-checklist.md`.

## What it is

- [ ] One change: one kit component, or one page with its states, on its own branch from the latest `main`.
- [ ] The Figma frames it implements are linked (page, state, 1440 and 375, light and dark).

## Words: wording keys only

- [ ] No sentence typed into a page or component: every visible or spoken word is `t(key)` from the wordings API, or
      `ApprovedText` / client data from the API shown as it is.
- [ ] `pnpm lint` passes with `react/jsx-no-literals` and the text-attribute rules unchanged, and no
      `eslint-disable` for them.
- [ ] Not in the lint's sight, checked by eye: no label in a `.ts` file, no text inside an image or SVG, no sentence
      passed through a helper.
- [ ] A key the catalogue lacks is asked for in this pull request and listed in `src/wordings/awaiting-backend.ts`;
      no sentence was written in its place.

## Switches and data respected

- [ ] Every state still draws: a section's `ready`, `locked`, `in_grade`, `empty`, `error`, `held`, `unavailable`,
      `not_in_area`; the plans Free, Full Report, Monitoring; the dashboard with no business; each error the endpoint
      lists.
- [ ] Nothing a switch hides is drawn with the switch off (`GET /api/v1/site`: `holding`, `checkout`,
      `checkoutWallets`, `aiChat`, `share`, `spanish`).
- [ ] The data comes from the API only: no value computed or invented, no other host called, no typed price, count
      or date. Anything the API does not send was asked of Backend first.
- [ ] Nothing of the Standard's internals (weights, points, check ids, counts of checks).

## Look

- [ ] Values come from tokens only (`src/brand/tokens.ts` → `pnpm tokens`): no raw colour, no square-bracket value,
      no inline style.
- [ ] A token change follows [`../TOKENS.md`](../TOKENS.md): an open question answered, a brand colour only with
      Raf's written yes, Backend told.
- [ ] One green button per view; no green text; Poppins only; logo ink or white.
- [ ] **Both themes** checked: light, dark, and the device's own.
- [ ] **Mobile** checked at 375 px, and 320 px reflow with no sideways scroll (except a table in its own box).
- [ ] Pictures attached: the frame and the new page side by side, at 1440 and 375, light and dark.

## Accessibility (WCAG 2.2 AA)

- [ ] axe has no finding on the changed pages, in both themes at 1440 and 375 px (say how it was run).
- [ ] Contrast 4.5:1 (3:1 for large text, field borders and the focus ring).
- [ ] Keyboard: every action reachable, focus visible (2 px, the text colour, never green), no trap.
- [ ] One `h1`, headings in order, labelled fields, captioned tables, 44 px tap targets on a phone, colour never the
      only signal, reduced motion respected.

## Safety

- [ ] No secret, key, token or `.env` file in the diff; no real person's or business's data in a fixture, test or
      picture (invented `*.test` businesses only).
- [ ] No production call: nothing points at `visigain.com` or a production service; Stripe in test mode only.
- [ ] No new script, font, style or image host, and no tag or embed on a signed-in page.
- [ ] The legal text comes from the API and sits where it did; the pay pages' consent box is never pre-ticked.
- [ ] Nothing under `api/`, `src/api/client` or `src/api/generated` edited by hand (`pnpm api:sync` only).

## Checks

- [ ] On this branch: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build` and
      `pnpm test:e2e` passed.
- [ ] CI (`ci`) is green.
