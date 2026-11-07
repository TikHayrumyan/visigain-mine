/**
 * t(): every word a visitor sees, by its key in the backend's approved catalogue (GET /api/v1/wordings).
 *
 *   const t = createT(entries, { locale: "en" });
 *   t("dashboard.overview.a_month", { price: "$149" })                  // "{price} a month." filled in
 *   t({ key: "site.pricing.limits_line", params: { locations: 1 } })     // a Wording from an API response
 *
 * Placeholders are written {name} (the pages' own values) or [name] (the registry's) in the catalogue
 * (docs/api.md, "Wordings"); both are filled from the params. Numbers and dates are formatted here for the locale. A key the
 * catalogue lacks is reported to the missing-key handler (a test fails on it: tests/setup.ts) and renders as the key
 * itself in development and with the mock, so the gap is visible; in production it renders nothing. A missing key is a
 * question for Backend, never a sentence to type (CONTRIBUTING.md).
 */
import { wordingParts, type Wording } from "@/api/client";

export type Entries = Readonly<Record<string, string>>;
export type Params = Readonly<Record<string, string | number | Date>>;
export type T = (wording: Wording, params?: Params) => string;

export interface TOptions {
  locale?: string;
  /** Render a missing key as the key (development, the mock) or as nothing (production). */
  showMissingKeys?: boolean;
}

type MissingKeyHandler = (key: string) => void;

const warned = new Set<string>();
const defaultHandler: MissingKeyHandler = (key) => {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[wordings] missing key "${key}": ask Backend for it (never type the sentence)`);
};
let missingKeyHandler: MissingKeyHandler = defaultHandler;

/** Replace what happens on a missing key (the tests make it throw). Returns the previous handler. */
export function setMissingKeyHandler(handler: MissingKeyHandler | null): MissingKeyHandler {
  const previous = missingKeyHandler;
  missingKeyHandler = handler ?? defaultHandler;
  return previous;
}

/** Whether a missing key renders as the key: everywhere except a production build talking to the real API. */
export function defaultShowMissingKeys(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV !== "production" || env.MOCK === "1";
}

function formatValue(value: string | number | Date, locale: string): string {
  if (typeof value === "number") return new Intl.NumberFormat(locale).format(value);
  if (value instanceof Date) return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(value);
  return value;
}

/** Fill the {name} and [name] placeholders of one sentence; a placeholder without a value is left as it is. */
export function fill(sentence: string, params: Params | undefined, locale = "en"): string {
  if (!params) return sentence;
  return sentence.replace(
    /\{([A-Za-z_][A-Za-z0-9_]*)\}|\[([A-Za-z_][A-Za-z0-9_]*)\]/g,
    (whole, curly?: string, square?: string) => {
      const value = params[(curly ?? square)!];
      return value === undefined ? whole : formatValue(value, locale);
    },
  );
}

export function createT(entries: Entries, options: TOptions = {}): T {
  const locale = options.locale ?? "en";
  const showMissingKeys = options.showMissingKeys ?? defaultShowMissingKeys();
  return (wording, params) => {
    const parts = wordingParts(wording);
    const sentence = entries[parts.key];
    if (sentence === undefined) {
      missingKeyHandler(parts.key);
      return showMissingKeys ? parts.key : "";
    }
    return fill(sentence, { ...parts.params, ...params }, locale);
  };
}
