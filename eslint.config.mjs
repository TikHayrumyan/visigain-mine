import next from "eslint-config-next";
import react from "eslint-plugin-react";

/**
 * No sentence is typed into this app: every visible word comes from the wordings API by key (CONTRIBUTING.md).
 * `react/jsx-no-literals` fails on any text between tags and any string drawn as a child; the restricted syntax below
 * adds what that rule does not see: a string in `cond ? "…" : …` or `cond && "…"` drawn as a child, and the
 * attributes a visitor reads or hears (aria-label, alt, title, placeholder …). Only punctuation is allowed.
 */
const PUNCTUATION = [
  "·",
  "•",
  "-",
  "–",
  "—",
  ":",
  ";",
  ",",
  ".",
  "/",
  "|",
  "(",
  ")",
  "[",
  "]",
  "&",
  "+",
  "×",
  "%",
  "…",
  "*",
  "#",
  "'",
  '"',
  "!",
  "?",
];
const TEXT_ATTRIBUTES =
  "^(aria-label|aria-description|aria-placeholder|aria-roledescription|aria-valuetext|alt|title|placeholder|label)$";
const LETTER = "/[A-Za-z0-9\u00C0-\uFFFF]/";

const config = [
  ...next,
  {
    files: ["src/**/*.tsx"],
    plugins: { react },
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true, allowedStrings: PUNCTUATION }],
      "no-restricted-syntax": [
        "error",
        {
          selector: `:matches(JSXElement, JSXFragment) > JSXExpressionContainer > :matches(ConditionalExpression, LogicalExpression) > Literal[value=${LETTER}]`,
          message: "No typed text in JSX: draw a wording with t(key).",
        },
        {
          selector: `:matches(JSXElement, JSXFragment) > JSXExpressionContainer > :matches(ConditionalExpression, LogicalExpression) > TemplateLiteral`,
          message: "No typed text in JSX: draw a wording with t(key).",
        },
        {
          selector: `JSXAttribute[name.name=/${TEXT_ATTRIBUTES}/] > Literal`,
          message: "No typed text in a visible or spoken attribute: use t(key).",
        },
        {
          selector: `JSXAttribute[name.name=/${TEXT_ATTRIBUTES}/] > JSXExpressionContainer > :matches(Literal, TemplateLiteral)`,
          message: "No typed text in a visible or spoken attribute: use t(key).",
        },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "src/api/generated/**",
      "src/api/client/**",
    ],
  },
];

export default config;
