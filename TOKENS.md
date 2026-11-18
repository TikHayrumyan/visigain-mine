# Tokens

Every design value is written once, in [`src/styles/tokens.ts`](src/styles/tokens.ts). `pnpm tokens` writes the three
marked regions of [`src/app/globals.css`](src/app/globals.css) from it (Tailwind's `@theme`, the type roles, and the
light and dark theme rules). Never edit those regions by hand: `pnpm lint` and `tests/tokens.test.ts` fail when they
are stale. Components use the token classes only (`bg-bg`, `text-fg`, `bg-surface`, `border-line`, `rounded-panel`,
`text-label-m` …), never a raw colour, and both themes follow.

The neutrals, fonts and text styles come from the Figma file "Visigain (Website)": `SITE_NEUTRAL` feeds the surface
roles, `WEB_FONT.sans` is Geist and `WEB_FONT.display` is Poppins, and `SITE_TYPE` holds Label/S, Label/M, Label/L,
Body/S and Headline/S. Both fonts are self-hosted from `@fontsource/geist` and `@fontsource/poppins` through
`next/font/local`.

## Changing a value

1. Edit `src/styles/tokens.ts`, then run `pnpm tokens`.
2. Check light and dark at 1440, 375 and 320 px.
3. Every text pair stays at 4.5:1 or better (3:1 for large text).
