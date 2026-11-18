/**
 * The visitor's theme: follow the system (the default), or their own choice of light or dark, kept in a cookie. The
 * server reads it and writes data-theme on <html>, so the first paint is already in the right theme.
 */
export type Theme = "system" | "light" | "dark";

export const THEMES: readonly Theme[] = ["light", "dark", "system"];
export const THEME_COOKIE = "vg_theme";

export function parseTheme(value: string | undefined | null): Theme {
  return value === "light" || value === "dark" ? value : "system";
}
