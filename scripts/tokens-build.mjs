#!/usr/bin/env node
/**
 * Writes the stylesheet's token blocks from the one table of token values:
 *   pnpm tokens                               rewrite src/app/globals.css where it is stale
 *   node scripts/tokens-build.mjs --check     change nothing; exit 1 when it is stale (`pnpm lint` runs it)
 *
 * src/styles/tokens.ts is the single source of every token value. The stylesheet needs the same values four times:
 * once in Tailwind's @theme block (the light values, which make the utility classes), and the theme's values again
 * for a page forced dark, a device set to dark, and a page forced light. Those blocks are generated here, between the
 * markers "tokens:theme", "tokens:type" and "tokens:themes" in src/app/globals.css; everything else in that file is
 * written by hand. tests/tokens.test.ts fails when the stylesheet and the table differ.
 */
import { readFileSync, writeFileSync } from "node:fs";

export const TOKENS_FILE = "src/styles/tokens.ts";
export const GLOBALS_FILE = "src/app/globals.css";

const kebab = (key) => key.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
const colour = (value) => value.toLowerCase();
const px = (n) => `${n}px`;
const lines = (indent, entries) =>
  entries.map(([name, value, note]) => `${indent}--${name}: ${value};${note ? ` /* ${note} */` : ""}`).join("\n");

/** The custom properties that follow the theme, in the stylesheet's order: the surface roles, the status colours, the chart palette. */
function themed(t, scheme) {
  return [
    ...Object.entries(t.THEME[scheme]).map(([k, v]) => [`color-${kebab(k)}`, colour(v)]),
    ...t.CHART[scheme].map((v, i) => [`color-chart-${i + 1}`, colour(v)]),
  ];
}

/** Tailwind's @theme block: every token as a utility class knows it, with the light values of what follows the theme. */
export function themeBlock(t) {
  const roles = Object.entries(t.THEME.light);
  const surface = roles.filter(([k]) => !/^(danger|ok|warn)/.test(k));
  const status = roles.filter(([k]) => /^(danger|ok|warn)/.test(k));
  const type = Object.entries(t.WEB_TYPE).flatMap(([name, s]) => [
    [`text-${name}`, s.size],
    [`text-${name}--line-height`, s.lineHeight],
    ...(s.letterSpacing ? [[`text-${name}--letter-spacing`, s.letterSpacing]] : []),
    ...(s.fontWeight ? [[`text-${name}--font-weight`, s.fontWeight]] : []),
  ]);
  const siteType = Object.entries(t.SITE_TYPE).flatMap(([name, s]) => [
    [`text-${kebab(name)}`, s.size],
    ...(s.lineHeight ? [[`text-${kebab(name)}--line-height`, s.lineHeight]] : []),
    ...(s.letterSpacing ? [[`text-${kebab(name)}--letter-spacing`, s.letterSpacing]] : []),
    ...(s.fontWeight ? [[`text-${kebab(name)}--font-weight`, s.fontWeight]] : []),
  ]);
  const B = t.BRAND;
  return `@theme {
${lines(
  "  ",
  Object.entries(t.WEB_FONT).map(([k, v]) => [`font-${k}`, v]),
)}

  /* Shape: pill buttons, 16px cards, 10px inputs, and the radius list (WEB_RADIUS). No shadows except on floating elements. */
${lines(
  "  ",
  Object.entries(t.WEB_RADIUS).map(([k, v]) => [
    k === "DEFAULT" ? "radius" : `radius-${kebab(k)}`,
    typeof v === "number" ? px(v) : v,
  ]),
)}
${lines(
  "  ",
  Object.entries(t.SHADOW).map(([k, v]) => [`shadow-${k}`, v]),
)}

  /* Type: Poppins 400 body, 600 UI, 700 subheads, 800 display. */
${lines("  ", type)}

  /* The public site's own sizes and the large grade tile's letter (SITE_TYPE): a size, and only what the places wrote. */
${lines("  ", siteType)}
${lines("  ", [["spacing", t.SPACING_UNIT], ...Object.entries(t.SPACING).map(([k, v]) => [`spacing-${kebab(k)}`, v])])}
${lines(
  "  ",
  Object.entries(t.CONTAINER).map(([k, v]) => [`container-${k}`, v]),
)}
${lines(
  "  ",
  Object.entries(t.EASE).map(([k, v]) => [`ease-${k}`, v]),
)}

  /* Brand colours: identical in light and dark. */
${lines("  ", [
  ["color-green", colour(B.green)],
  ["color-green-dark", colour(B.greenDark)],
  ["color-green-tint", colour(B.greenTint)],
  ["color-paper", colour(B.paper)],
  ["color-paper-2", colour(B.paper2)],
  ["color-ink", colour(B.ink)],
  ["color-ink-2", colour(B.ink2)],
  ["color-white", colour(B.white)],
  ["color-on-paper-2", colour(B.text2), "secondary text on paper (6.0:1)"],
  ["color-on-ink-2", colour(B.text2Dark), "secondary text on ink (7.0:1)"],
  ...Object.entries(t.GRADE_COLOR).map(([g, v]) => [`color-grade-${g.toLowerCase()}`, colour(v)]),
])}

  /* Surface roles (light values; dark below). line and surface-2 are derived neutrals, not in the brand pack. */
${surface
  .map(
    ([k, v]) =>
      `${k === "lineStrong" ? "  /* The border of a form field (WCAG 1.4.11, 6 October 2026): 3:1 or better on the field's fill and on the page. */\n" : ""}${lines("  ", [[`color-${kebab(k)}`, colour(v)]])}`,
  )
  .join("\n")}

  /* Status colours: semantic, separate from the brand green (admin pills, alerts). */
${lines("  ", [...status.map(([k, v]) => [`color-${kebab(k)}`, colour(v)]), ["color-staging", colour(t.STAGING.bg)], ["color-staging-fg", colour(t.STAGING.fg)]])}

  /* The one chart palette (admin analytics): series 1..6, in this order everywhere. Distinct in colour-blind vision. */
${lines(
  "  ",
  t.CHART.light.map((v, i) => [`color-chart-${i + 1}`, colour(v)]),
)}
}`;
}

/**
 * The type roles of the client's pages (TYPE_ROLE), in a theme block of their own: each role is a Tailwind font-size
 * token, so a component writes `text-<role>` and gets the size with its line height, weight and letter spacing (a
 * `leading-*` or `font-*` class beside it still wins, as with Tailwind's own sizes). A value the role leaves out is
 * not written, and so is inherited.
 */
export function typeBlock(t) {
  const roles = Object.entries(t.TYPE_ROLE).flatMap(([name, s]) => {
    const role = `text-${kebab(name)}`;
    return [
      [role, s.size],
      ...(s.lineHeight ? [[`${role}--line-height`, s.lineHeight]] : []),
      ...(s.letterSpacing ? [[`${role}--letter-spacing`, s.letterSpacing]] : []),
      ...(s.fontWeight ? [[`${role}--font-weight`, s.fontWeight]] : []),
    ];
  });
  return `/*
 * The type roles of the signed-in client's pages: a kit component names a role (text-card-title, text-caption), never a
 * size. The values are today's; a type scale from a design changes them in src/styles/tokens.ts (TYPE_ROLE).
 */
@theme {
${lines("  ", roles)}
}`;
}

/** The base layer's theme rules: the properties Tailwind would drop, then dark by attribute, dark by the device, light by attribute. */
export function themesBlock(t) {
  const chartLight = t.CHART.light.map((v, i) => [`color-chart-${i + 1}`, colour(v)]);
  const grades = Object.entries(t.GRADE_COLOR).map(([g, v]) => [`color-grade-${g.toLowerCase()}`, colour(v)]);
  return `  /* Tailwind drops theme variables no class uses; these are read through var() in inline styles and SVG. */
  :root {
${lines("    ", [...chartLight, ...grades])}
    color-scheme: light dark;
  }
  [data-theme="dark"] {
${lines("    ", themed(t, "dark"))}
    color-scheme: dark;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]):not([data-theme="dark"]),
    [data-theme="system"] {
${lines("      ", themed(t, "dark"))}
      color-scheme: dark;
    }
  }
  [data-theme="light"] {
${lines("    ", themed(t, "light"))}
    color-scheme: light;
  }`;
}

const MARK = {
  theme: [
    "/* tokens:theme:begin (generated by scripts/tokens-build.mjs from src/styles/tokens.ts; do not edit here) */",
    "/* tokens:theme:end */",
  ],
  type: [
    "/* tokens:type:begin (generated by scripts/tokens-build.mjs from src/styles/tokens.ts; do not edit here) */",
    "/* tokens:type:end */",
  ],
  themes: [
    "  /* tokens:themes:begin (generated by scripts/tokens-build.mjs from src/styles/tokens.ts; do not edit here) */",
    "  /* tokens:themes:end */",
  ],
};

/** The stylesheet with its two generated regions written from the tokens; the rest of the text is left as it is. */
export function generatedCss(current, tokens) {
  let css = current.replace(/\r\n/g, "\n");
  for (const [name, text] of [
    ["theme", themeBlock(tokens)],
    ["type", typeBlock(tokens)],
    ["themes", themesBlock(tokens)],
  ]) {
    const [begin, end] = MARK[name];
    const from = css.indexOf(begin);
    const to = css.indexOf(end);
    if (from < 0 || to < from) throw new Error(`${GLOBALS_FILE} has no "tokens:${name}" markers`);
    css = `${css.slice(0, from)}${begin}\n${text}\n${css.slice(to)}`;
  }
  return css;
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/tokens-build.mjs")) {
  // The table is TypeScript: tsx (a development dependency already used by every script here) reads it.
  const { tsImport } = await import("tsx/esm/api");
  const tokens = await tsImport(`../${TOKENS_FILE}`, import.meta.url);
  const current = readFileSync(GLOBALS_FILE, "utf8");
  const next = generatedCss(current, tokens);
  if (current.replace(/\r\n/g, "\n") === next) console.log(`${GLOBALS_FILE} is up to date with ${TOKENS_FILE}`);
  else if (process.argv.includes("--check")) {
    console.error(`${GLOBALS_FILE} is stale: run "node scripts/tokens-build.mjs"`);
    process.exit(1);
  } else {
    writeFileSync(GLOBALS_FILE, next);
    console.log(`wrote the token blocks of ${GLOBALS_FILE} from ${TOKENS_FILE}`);
  }
}
