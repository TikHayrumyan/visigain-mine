/**
 * The visitor's theme: follow the system (the default), or their own choice of light or dark, kept in one first-party
 * cookie that holds only "light" or "dark" (a strictly necessary preference: no consent needed). The server reads it
 * and writes data-theme on <html>, so the first paint is already in the right theme: no flash and no script. The same
 * rule and cookie name as the backend's src/server/web/theme.ts.
 */
export type Theme = "system" | "light" | "dark";
export const THEMES: readonly Theme[] = ["light", "dark", "system"];
export const THEME_COOKIE = "vg_theme";

export function parseTheme(v: string | undefined | null): Theme {
  return v === "light" || v === "dark" ? v : "system";
}

/** A same-site path to return to after the switch (never another site). */
export function safeBack(v: unknown): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : "/";
}
