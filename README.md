# visigain-frontend

The Visigain public website: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind 4.

This is **Next.js 16**: when an API looks unfamiliar, read the guide in `node_modules/next/dist/docs/` first
([`AGENTS.md`](AGENTS.md)).

## Start

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| script           | what it does                                                  |
| ---------------- | ------------------------------------------------------------- |
| `pnpm dev`       | the dev server                                                |
| `pnpm build`     | a production build                                            |
| `pnpm typecheck` | TypeScript                                                    |
| `pnpm lint`      | ESLint, and checks the generated token CSS is up to date      |
| `pnpm format`    | Prettier                                                      |
| `pnpm test`      | unit tests (Vitest)                                           |
| `pnpm tokens`    | regenerates the token blocks of `globals.css` from the tokens |

## Structure

```text
public/icons/            logo and icons
src/
  app/                   routes: layout.tsx, page.tsx, not-found.tsx, globals.css
  components/
    layout/              on every page: top-bar, header/ (with the phone menu), footer/, logo-link
    home/                the home page's sections
    ui/                  small shared pieces (theme-switch)
  config/navigation.ts   the site's links and their labels
  lib/theme/             light, dark or system: the cookie, the server action
  styles/tokens.ts       every design value (TOKENS.md)
scripts/tokens-build.mjs writes the token CSS from src/styles/tokens.ts
tests/                   unit tests
```

## Themes

Colours are token roles (`bg-bg`, `text-fg`, `text-muted`, `border-line`, `bg-surface` …). `pnpm tokens` generates the
light values, the dark values (`[data-theme="dark"]`) and the device's own (`prefers-color-scheme`) from
`src/styles/tokens.ts`. The theme switch stores the choice in a cookie and the server writes `data-theme` on `<html>`,
so the first paint is right. A block that is dark in both themes sets `data-theme="dark"` on itself.
