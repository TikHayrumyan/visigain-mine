/**
 * Visigain design tokens: THE ONE PLACE IN THIS REPOSITORY WHERE A TOKEN VALUE IS WRITTEN.
 *
 * The brand colours are brand v1.2. The theme's neutrals, the web font and the site's type styles are the website
 * design's (Figma "Visigain (Website)"; TOKENS.md).
 *
 * Who reads it:
 * - the stylesheet: the token blocks of src/app/globals.css (Tailwind's @theme and the theme rules, light and dark)
 *   are generated from this file by `pnpm tokens` (scripts/tokens-build.mjs); `pnpm lint` and a test fail when they
 *   are stale (tests/tokens.test.ts);
 * - code that needs a value CSS cannot give (a <meta name="theme-color">) imports it.
 * After an edit here: `pnpm tokens`.
 */
export const BRAND = {
  green: "#19C865",
  /** Filled button: hovered is lighter, focused is greenDark, pressed is darker still. */
  greenHover: "#3FD47F",
  greenDark: "#15AC57",
  greenPressed: "#0F8F47",
  greenTint: "#DFF7E9",
  paper: "#FAF6EE",
  paper2: "#F2EEE5",
  ink: "#0E0F0F",
  ink2: "#1A1C1C",
  white: "#FFFFFF",
  /** Secondary text on paper or white (6.0:1 on paper). */
  text2: "#5C5F5F",
  /** Secondary text on ink (7.0:1). */
  text2Dark: "#9A9D9D",
  /** Form-field borders (6 October 2026, WCAG 1.4.11): the hairline's own tone, taken to 3:1 or better on white, paper and paper 2 (light) and on ink, raised ink and surface 2 (dark). */
  lineStrong: "#8C867A",
  lineStrongDark: "#6E7272",
} as const;

/** Functional colours for the A to F grade only. The letter on a grade tile is always ink. */
export const GRADE_COLOR: Record<"A" | "B" | "C" | "D" | "F", string> = {
  A: "#19C865",
  B: "#8CE4B2",
  C: "#F2B01E",
  D: "#EF7A2B",
  F: "#E0412F",
};

export function gradeColor(letter: string | null | undefined): string {
  const l = (letter ?? "").trim().toUpperCase().charAt(0);
  return l === "A" || l === "B" || l === "C" || l === "D" || l === "F" ? GRADE_COLOR[l] : BRAND.paper2;
}

/** Status colours for print and email (semantic, separate from the brand green). */
export const STATUS = { danger: "#B42318", ok: "#067647", warn: "#B54708" } as const;

/** The STAGING badge in the admin: the same in both themes. */
export const STAGING = { bg: "#F59E0B", fg: "#1C1917" } as const;

/**
 * The website design's neutrals (Figma "Visigain (Website)": its Elements, Borders and Surfaces variables, and the
 * page's own fill). The theme's surface roles below take them.
 */
export const SITE_NEUTRAL = {
  page: "#FAF9F4",
  pageDark: "#0F0F0E",
  primaryDark: "#F3F2EE",
  secondary: "#686A67",
  secondaryDark: "#9D9D97",
  tertiary: "#9B9C98",
  tertiaryDark: "#75756F",
  border: "#EBE9E3",
  borderDark: "#2C2C29",
  /** The design's "border-darken" (the hero's scan field); light: its browser window's dots. */
  borderDarken: "#D8D6CF",
  borderDarkenDark: "#3A3A36",
  surfaceDark: "#1A1A18",
  /** The design's "on-surface": a bar or a track on a white card. */
  onSurface: "#F8F7F3",
  onSurfaceDark: "#20201E",
} as const;

/**
 * What follows the theme on a page: the surface roles and the status colours, light and dark. The stylesheet's three
 * theme rules (forced dark, a device set to dark, forced light) and the light values in @theme are generated from this
 * one table, in this order. A role that is a brand colour names it; the others are derived neutrals and status tones
 * that are not in the brand pack.
 */
export const THEME = {
  light: {
    bg: SITE_NEUTRAL.page,
    fg: BRAND.ink,
    muted: SITE_NEUTRAL.secondary,
    faint: SITE_NEUTRAL.tertiary,
    line: SITE_NEUTRAL.border,
    lineDarken: SITE_NEUTRAL.borderDarken,
    lineStrong: BRAND.lineStrong,
    surface: BRAND.white,
    surface2: BRAND.paper2,
    surfaceSubtle: SITE_NEUTRAL.onSurface,
    danger: STATUS.danger,
    dangerSoft: "#FDECEA",
    ok: STATUS.ok,
    okSoft: "#E7F6EC",
    warn: STATUS.warn,
    warnSoft: "#FEF4E6",
    /** The website design's answer chips: "Named" and "Not named". */
    chipOk: "#E3F6E9",
    chipWarn: "#FDF3DC",
    chipWarnText: "#7A4D00",
    /** The empty part of an assistant's share ring. */
    ringTrack: "#E6E4DD",
    /** The pale panel behind the map-rank grid. */
    gridWash: "#F0F2FF",
    /** The tile under the rank dots, before the map image. */
    map: "#EEF0EA",
    /** The pale panel behind the reviews card. */
    reviewWash: "#FDEBDC",
    /** The neutral pill on a white card: "Usually needs help". */
    chipNeutral: "#F4F3EF",
  },
  dark: {
    bg: SITE_NEUTRAL.pageDark,
    fg: SITE_NEUTRAL.primaryDark,
    muted: SITE_NEUTRAL.secondaryDark,
    faint: SITE_NEUTRAL.tertiaryDark,
    line: SITE_NEUTRAL.borderDark,
    lineDarken: SITE_NEUTRAL.borderDarkenDark,
    lineStrong: BRAND.lineStrongDark,
    surface: SITE_NEUTRAL.surfaceDark,
    surface2: "#252828",
    surfaceSubtle: SITE_NEUTRAL.onSurfaceDark,
    danger: "#F97066",
    dangerSoft: "#3A1512",
    ok: "#47CD89",
    okSoft: "#0F2A1B",
    warn: "#FDB022",
    warnSoft: "#33220F",
    chipOk: "#0F2A1B",
    chipWarn: "#33220F",
    chipWarnText: "#FDB022",
    ringTrack: "#E6E4DD",
    gridWash: "#1C2033",
    map: "#1C211C",
    reviewWash: "#3A2A1C",
    chipNeutral: "#2A2A28",
  },
} as const;

/** The one chart palette (admin analytics): series 1 to 6, in this order everywhere. Distinct in colour-blind vision. */
export const CHART = {
  light: [BRAND.ink, "#0E9384", "#D97706", "#C11574", "#0086C9", "#6B7280"],
  dark: [BRAND.white, "#2ED3B7", "#FBBF24", "#F670C7", "#53B1FD", "#9CA3AF"],
} as const;

export const FONT_STACK = '"Poppins", "Segoe UI", system-ui, -apple-system, Helvetica, Arial, sans-serif';
export const RADIUS = { card: 16, input: 10, button: 999 } as const;

/*
 * The web's own tokens (the stylesheet's @theme block is generated from them). Geist (the website design's text face)
 * and Poppins (its display face) reach a page as the --font-geist and --font-poppins variables (src/app/layout.tsx),
 * so the web's font stack is not the emails' FONT_STACK.
 */
export const WEB_FONT = {
  sans: 'var(--font-geist), "Segoe UI", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  display: 'var(--font-poppins), "Segoe UI", system-ui, sans-serif',
} as const;
/**
 * The radius list: a number is CSS pixels, a string is written as it is. Each is the class `rounded-<name>`
 * (`DEFAULT` is the plain `rounded`). The first four are the brand's (pill buttons, 16px cards, 10px inputs); the rest
 * were named on 15 October 2026 with the value each place had that day. A disc (`rounded-full` on a dot, a step's number, a grid mark) and the grid
 * marks' shapes are geometry, not a radius, and keep Tailwind's own classes.
 */
export const WEB_RADIUS = {
  /** A panel's inner box: a state note, a menu row, a select, a tag on the public site. */
  md: 10,
  card: RADIUS.card,
  input: RADIUS.input,
  button: RADIUS.button,
  /** A chip or a bar that is round at both ends: a status pill, a plan chip, "Not available yet", a progress bar. */
  pill: 999,
  /** The grade tile at its small and middle sizes (the large tile is a card). */
  tile: 10,
  /** The small box: a "Test" tag, a chart's table view (Tailwind's `rounded`, the same 4px). */
  DEFAULT: "0.25rem",
  /** The smallest: a chart legend's colour sample (Tailwind's `rounded-sm`, the same 4px). */
  sm: "0.25rem",
  /** A tile that holds an icon or a letter on the public site (the features' icons, the public grade page's letter). */
  icon: "0.75rem",
  /** The sample grade card beside the homepage's hero. */
  siteCard: 18,
  /** The logo's icon on its tile: a share of the tile's side, the brand pack's shape. */
  logo: "22%",
  /** The dark panel the header sits on (the homepage's hero), on a wide screen; `panelSm` on a phone and the open menu. */
  panel: 32,
  panelSm: 24,
  /** A floating card of the website design (the hero's "By area"). */
  cardLg: 28,
} as const;
/**
 * No shadows except on floating elements: ink at 28%. The website design's: `pill` the compact header, `window` and
 * `windowSm` the hero's browser window (wide screen, phone), `card` a card floating over it, `field` the scan field.
 */
export const SHADOW = {
  float: "0 24px 60px rgb(14 15 15 / 0.28)",
  pill: "0 8px 24px rgb(23 20 13 / 0.08)",
  window: "0 24px 64px rgb(14 15 15 / 0.08)",
  windowSm: "0 12px 32px rgb(14 15 15 / 0.08)",
  card: "0 16px 48px rgb(14 15 15 / 0.12)",
  /** The "You vs top 3" card: tighter on a wide screen, taller on a phone. */
  compare: "0 16px 24px rgb(14 15 15 / 0.06)",
  compareSm: "0 16px 48px rgb(14 15 15 / 0.06)",
  field: "0 12px 16px rgb(0 0 0 / 0.25)",
  /** The business-type search pill sitting on the category marquee. */
  search: "0 12px 16px rgb(23 20 13 / 0.1)",
  /** A feature card lifting off the one behind it. */
  lift: "0 -8px 40px rgb(23 20 13 / 0.06)",
} as const;
/** The web type scale: Poppins 400 body, 600 UI, 700 subheads, 800 display. */
export const WEB_TYPE: Record<
  "display" | "title" | "subhead" | "lead",
  { size: string; lineHeight: string; letterSpacing?: string; fontWeight?: string }
> = {
  display: { size: "clamp(2.25rem, 5.4vw, 4rem)", lineHeight: "1", letterSpacing: "-0.04em", fontWeight: "800" },
  title: { size: "clamp(1.75rem, 3.8vw, 2.75rem)", lineHeight: "1.06", letterSpacing: "-0.035em", fontWeight: "800" },
  subhead: { size: "1.25rem", lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "700" },
  lead: { size: "1rem", lineHeight: "1.6" },
};
/**
 * The type ROLES of the signed-in client's pages (the owner, 10 October 2026: "the kit edits a new type scale would
 * need"). A kit component names the role its text plays (the class `text-<role>`: `text-card-title`, `text-caption`),
 * never a size: a type scale from a design is then a change of the values here, followed by
 * `pnpm tokens`, and not an edit of every component.
 *
 * Each role holds what the components were set in on the day the roles were named (Tailwind's own `text-sm`,
 * `font-semibold` and so on). A value left out is INHERITED from the text around it, exactly as before: `body`
 * and `caption` take the weight of where they stand (400 on a page), and `tableCellDense` its line height. A design
 * that fixes one of them writes it here.
 */
export interface TypeRole {
  size: string;
  lineHeight?: string;
  fontWeight?: string;
  letterSpacing?: string;
}
export const TYPE_ROLE = {
  /** The title of a client page (the h1 of the page's title row). */
  pageTitle: { size: "1.25rem", lineHeight: "calc(1.75 / 1.25)", fontWeight: "600" },
  /** The title of a panel (a card on the dashboard and on a part's page). */
  cardTitle: { size: "1rem", lineHeight: "calc(1.5 / 1)", fontWeight: "700" },
  /** A heading inside a panel, a line that leads a block, a chart's title. */
  label: { size: "0.875rem", lineHeight: "calc(1.25 / 0.875)", fontWeight: "600" },
  /** The words on a button. */
  button: { size: "0.875rem", lineHeight: "calc(1.25 / 0.875)", fontWeight: "600" },
  /** Running text in a panel: sentences, lists, a state's one line, the choice pills. */
  body: { size: "0.875rem", lineHeight: "calc(1.25 / 0.875)" },
  /** The small line: a date line, a figure's label and note, a legend, the map's credit, a plan chip. */
  caption: { size: "0.75rem", lineHeight: "calc(1 / 0.75)" },
  /** A status pill, a change marker ("▲ up 2"), "Not available yet". */
  badge: { size: "0.75rem", lineHeight: "calc(1 / 0.75)", fontWeight: "500" },
  /** The big number of a figure. */
  figureLarge: { size: "1.5rem", lineHeight: "calc(2 / 1.5)", fontWeight: "700" },
  /** A number that leads a block of the dashboard. */
  figure: { size: "1.125rem", lineHeight: "calc(1.75 / 1.125)", fontWeight: "700" },
  /** A number inside a table's cell. */
  figureSmall: { size: "1rem", lineHeight: "calc(1.5 / 1)", fontWeight: "700" },
  /** A table of a panel (the table with a caption): its cells. */
  tableCell: { size: "0.875rem", lineHeight: "calc(1.25 / 0.875)" },
  /** The same table set tighter (many rows). Its line height is the page's. */
  tableCellDense: { size: "13px" },
  /** That table's column headings: the size of its cells (1em), heavier. */
  tableHead: { size: "1em", fontWeight: "600" },
  /** The list table (Reports, Sessions, Team, Billing): its cells. */
  dataCell: { size: "13px", lineHeight: "1.25rem" },
  /** The list table's column headings. */
  dataHead: { size: "0.75rem", lineHeight: "calc(1 / 0.75)", fontWeight: "500" },
} as const satisfies Record<string, TypeRole>;
/**
 * The public site's own type sizes, and the large grade tile's letter (named on 15 October 2026 with the value each
 * place had that day; before, each was written in square brackets). Like a role, a value left out is inherited (a
 * `leading-*` or `font-*` class beside it still sets it). The first five are the website design's text styles, by
 * their Figma names (Label/S 12|16 and so on), with the line height and weight Figma gives them.
 */
export const SITE_TYPE = {
  labelS: { size: "12px", lineHeight: "16px", fontWeight: "500" },
  labelM: { size: "14px", lineHeight: "20px", fontWeight: "500" },
  labelL: { size: "15px", lineHeight: "20px", fontWeight: "500" },
  bodyS: { size: "13px", lineHeight: "18px", fontWeight: "400" },
  bodyM: { size: "14px", lineHeight: "20px", fontWeight: "400" },
  bodyL: { size: "15px", lineHeight: "22px", fontWeight: "400" },
  headlineS: { size: "22px", lineHeight: "28px", fontWeight: "500", letterSpacing: "-0.02em" },
  /** Headline/M 28|34, the phone's section title. */
  headlineM: { size: "28px", lineHeight: "34px", fontWeight: "500", letterSpacing: "-0.025em" },
  /** Display/M 40|44, a wide screen's section title. */
  headlineL: { size: "40px", lineHeight: "44px", fontWeight: "500", letterSpacing: "-0.035em" },
  /** Title/L 20|26, a card's title. */
  titleL: { size: "20px", lineHeight: "26px", fontWeight: "500", letterSpacing: "-0.015em" },
  /** Title/S 16|22, an eyebrow and a tile name. */
  titleS: { size: "16px", lineHeight: "22px", fontWeight: "500", letterSpacing: "-0.01em" },
  displayS: { size: "36px", lineHeight: "36px", fontWeight: "500", letterSpacing: "-0.035em" },
  displayM: { size: "56px", lineHeight: "64px", fontWeight: "500", letterSpacing: "-0.04em" },
  /** The address in the phone's small browser window mockup. */
  mockupAddress: { size: "7px", lineHeight: "10px", fontWeight: "500" },
  /** The small line above a hero's title. */
  siteEyebrow: { size: "13px" },
  /** The small line under each of the three figures of the strip under the hero. */
  siteStripNote: { size: "13px" },
  /** The big figure of the strip under the hero. */
  siteStripFigure: { size: "26px" },
  /** The sample grade card: its score. */
  siteCardFigure: { size: "30px" },
  /** The sample grade card: its label, its bars and its note. */
  siteCardNote: { size: "12.5px" },
  /** The title of a feature, and a question of the FAQ. */
  siteItemTitle: { size: "17px" },
  /** An offer's name on the pricing page. */
  siteOfferTitle: { size: "22px" },
  /** A line that leads on under a section (a link to the refund terms, to all questions). */
  siteLeadIn: { size: "15px" },
  /** The footer's text. */
  siteFooter: { size: "13.5px" },
  /** A footer column's heading (in capitals). */
  siteFooterHead: { size: "11.5px", letterSpacing: "0.08em" },
  /** The letter on the large grade tile. */
  gradeTileLarge: { size: "42px" },
} as const satisfies Record<string, TypeRole>;
/**
 * Spacing. The UNIT is Tailwind's spacing step (`p-1` is one unit, `gap-2.5` two and a half): every numeric spacing,
 * width and height class of the product is a multiple of it, so it is a token too (it is Tailwind's own value, 0.25rem,
 * written here so a design on another grid is one value). The named spacings are for a rhythm a design is likely to
 * set on its own: each holds the value its places had on 15 October 2026 (`section` and `stack` since brand v1.1).
 */
export const SPACING_UNIT = "0.25rem";
export const SPACING = {
  section: "4rem",
  stack: "1.5rem",
  /** Inside a panel or a card of the client's pages (the dashboard's panels, the shared card, the pay page's boxes). */
  panel: "1.25rem",
  /** A chip's padding, across and down (a status pill, a plan chip, "Not available yet", "Sample data"). */
  chipX: "0.5rem",
  chipY: "0.125rem",
  /** Inside a card of the public site (the offers, the steps, the sample grade card). */
  siteCard: "22px",
  /** Above and below each figure of the strip under the hero. */
  siteStrip: "22px",
  /** Between the links of the public site's top menu. */
  siteNav: "22px",
  /** Above and below a hero's content on a wide screen. */
  hero: "4.5rem",
} as const;
/** `content` is the website design's 1200px column (the header, the top bar and the footer line up on it). */
export const CONTAINER = { site: "72rem", prose: "42rem", content: "100rem" } as const;
/** The website design's motion curve: reveals and the compact header (`ease-reveal`). */
export const EASE = { reveal: "cubic-bezier(0, 0, 0.58, 1)" } as const;
