# Tokens

Every design value is written once, in [`src/brand/tokens.ts`](src/brand/tokens.ts). `pnpm tokens` writes the three
marked regions of [`src/app/globals.css`](src/app/globals.css) from it (Tailwind's `@theme`, the type roles, and the
light and dark theme rules). Never edit those regions by hand: `pnpm lint` and `tests/tokens.test.ts` fail when they
are stale. Components use the token classes only (`bg-bg`, `text-fg`, `bg-surface`, `border-line`, `rounded-card`,
`text-card-title` …), never a raw colour or a square-bracket value, and both themes follow.

**Today's values are the backend's** (brand v1.2, locked; the backend's `src/brand/tokens.ts` of 6 November 2026),
ported unchanged, with the same generator (`scripts/tokens-build.mjs`). Poppins is self-hosted from the
`@fontsource/poppins` package (weights 400 to 800) through `next/font/local`: no request goes to Google.

## Open: Illia's design against ours

The design hand-off ([`docs/design-handoff.md`](docs/design-handoff.md), section 6) lists questions that Illia and Raf
answer. **Until they do, our values stay the defaults**, and none of Illia's values that depend on them is adopted.

| #   | question                                                                                | our value until answered                                                                                               | Illia's value (not adopted)                                                                                             |
| --- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | **Geist** for body and labels? Brand v1.2 is Poppins only                               | Poppins for everything (`WEB_FONT.sans`)                                                                               | Geist 87 % of text, Poppins 500 for headings                                                                            |
| 2   | **Heading weight**: Poppins 500 everywhere?                                             | 600 UI and page titles, 700 subheads and card titles, 800 display (`TYPE_ROLE`, `WEB_TYPE`)                            | 500                                                                                                                     |
| 3   | **Page colour** #EFEEE9 instead of paper, in the dashboard only or the public site too? | `bg` = paper #FAF6EE light, ink #0E0F0F dark                                                                           | #EFEEE9 / #0F0F0E                                                                                                       |
| 4   | **Contrast**: may the failing tones be darkened, and to what?                           | `muted` = `faint` #5C5F5F (6.0:1 on paper) / #9A9D9D; `lineStrong` #8C867A / #6E7272 (3:1 or better for field borders) | Tertiary #9B9C98 (2.4 to 2.8:1, fails AA), Secondary #686A67 (4.7:1 on the page colour), Border Darken #D8D6CF (1.45:1) |

The other questions of section 6 (the green short logo, duplicate variable names, the Typography sheet, the by-area bar
colours, card radius 28 and panel radius 20, missing screens, switched-off features, review texts, sample data, the
`Tag / h2 skipped` component) are open too. Card and panel radii stay 16 (`WEB_RADIUS.card`) until question 9 is
answered.

## Changing a value

1. Map Illia's variable to our token (a variable with no token of ours, or a token with no variable, is a question
   before any code). [`docs/design-handoff.md`](docs/design-handoff.md) section 4 has the table.
2. A **brand colour** (green, paper, ink, a grade colour) is a new brand version: Raf says yes first, and the backend
   changes with it (its emails and PDFs read the same table). Surface, status and chart colours, radii, spacing and
   type are free to change once the open question that covers them is answered.
3. Edit `src/brand/tokens.ts`, run `pnpm tokens`, check light and dark at 1440, 375 and 320 px.
4. Every text pair stays at 4.5:1 or better (3:1 for large text and field borders).
5. Tell Backend in the pull request: the backend's token file should move with ours, so the emails, PDFs and the
   current app keep the same look.
