<!-- The checklist for every pull request: docs/pr-checklist.md. Tick what is true; say why for anything left
     unticked. Backend reviews against this list. -->

## What and why

<!-- One change: one kit component or one page. The Figma frames it implements (links). -->

- [ ] One change: one kit component, or one page with its states, on its own branch from the latest `main`
- [ ] The Figma frames it implements are linked (page, state, 1440 and 375, light and dark)

## Words: wording keys only

- [ ] No sentence typed; every visible or spoken word is `t(key)`, or ApprovedText / client data from the API
- [ ] `pnpm lint` passes with the no-literal-text rules unchanged and no `eslint-disable` for them
- [ ] No label in a `.ts` file, no text in an image or SVG, no sentence passed through a helper
- [ ] Any key the catalogue lacks is asked for here and listed in `src/wordings/awaiting-backend.ts`

<!-- Keys asked of Backend (page, state, frame, where it sits, why, Illia's proposed sentence): -->

## Switches and data respected

- [ ] Every state and plan still draws (ready, locked, in_grade, empty, error, held, unavailable, not_in_area; Free, Full Report, Monitoring; no business; the endpoint's errors)
- [ ] Nothing a switch hides is drawn with it off (`/site`: holding, checkout, checkoutWallets, aiChat, share, spanish)
- [ ] Data from the API only: nothing computed or invented, no other host, no typed price, count or date; nothing of the Standard's internals

## Look

- [ ] Token values only (no raw colour, square-bracket value or inline style); token changes follow TOKENS.md
- [ ] One green button per view; no green text; Poppins only; logo ink or white
- [ ] Both themes checked (light, dark, the device's own)
- [ ] Mobile checked (375 px, 320 px reflow)
- [ ] Side-by-side pictures attached (frame and page, 1440 and 375, light and dark)

## Accessibility (WCAG 2.2 AA)

- [ ] axe: no finding on the changed pages, both themes, 1440 and 375 px
- [ ] Contrast, keyboard and focus, headings, labels, captions, 44 px targets checked

## Safety

- [ ] No secret, key, token or .env file; no real person's or business's data (invented `*.test` only)
- [ ] No production call; Stripe test mode only; no new script, font or style host; no tag on a signed-in page
- [ ] Legal text from the API, where it was; `api/`, `src/api/client`, `src/api/generated` untouched by hand

## Checks

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm test:e2e` passed locally
- [ ] CI `ci` green
