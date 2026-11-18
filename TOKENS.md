# Tokens

Every design value is written once, in [`src/brand/tokens.ts`](src/brand/tokens.ts). `pnpm tokens` writes the three
marked regions of [`src/app/globals.css`](src/app/globals.css) from it (Tailwind's `@theme`, the type roles, and the
light and dark theme rules). Never edit those regions by hand: `pnpm lint` and `tests/tokens.test.ts` fail when they
are stale. Components use the token classes only (`bg-bg`, `text-fg`, `bg-surface`, `border-line`, `rounded-card`,
`text-card-title` …), never a raw colour or a square-bracket value, and both themes follow.

**The brand colours are the backend's** (brand v1.2, locked; the backend's `src/brand/tokens.ts` of 6 November 2026),
ported unchanged, with the same generator (`scripts/tokens-build.mjs`). **The theme's neutrals, the web font and the
site's text styles are the website design's** (Figma "Visigain (Website)", adopted 18 November 2026): `SITE_NEUTRAL`
feeds the surface roles, `WEB_FONT.sans` is Geist and `WEB_FONT.display` Poppins, and `SITE_TYPE` holds Label/S,
Label/M, Label/L, Body/S and Headline/S. Both fonts are self-hosted from the `@fontsource/geist` (400, 500) and
`@fontsource/poppins` (400 to 800) packages through `next/font/local`: no request goes to Google.

## Illia's design against ours

The design hand-off ([`docs/design-handoff.md`](docs/design-handoff.md), section 6) lists questions that Illia and Raf
answer.

| #   | question                                                                                | state                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Geist** for body and labels? Brand v1.2 is Poppins only                               | adopted: Geist for text (`WEB_FONT.sans`), Poppins for display (`WEB_FONT.display`)                                                    |
| 2   | **Heading weight**: Poppins 500 everywhere?                                             | open: 600 UI and page titles, 700 subheads and card titles, 800 display (`TYPE_ROLE`, `WEB_TYPE`)                                      |
| 3   | **Page colour** #EFEEE9 instead of paper, in the dashboard only or the public site too? | adopted for the public site: the website file's page #FAF9F4 / #0F0F0E (`SITE_NEUTRAL`); paper stays a brand colour                    |
| 4   | **Contrast**: may the failing tones be darkened, and to what?                           | open: `faint` is the design's Tertiary #9B9C98 / #75756F, below 4.5:1 for small text (the footer's column headings and copyright line) |

The other questions of section 6 (the green short logo, duplicate variable names, the Typography sheet, the by-area bar
colours, card radius 28 and panel radius 20, missing screens, switched-off features, review texts, sample data, the
`Tag / h2 skipped` component) are open too. Card radii stay 16 (`WEB_RADIUS.card`) until question 9 is answered; the
website's dark panel under the header is 32 and 24 on a phone (`WEB_RADIUS.panel`, `panelSm`).

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
