import { setTheme } from "@/theme/action";
import { THEMES, type Theme } from "@/theme/theme";
import type { T } from "@/wordings/t";

const LABEL: Record<Theme, string> = {
  light: "common.theme_toggle.light",
  dark: "common.theme_toggle.dark",
  system: "common.theme_toggle.follow_my_device",
};

/**
 * The theme switch: light, dark or the device's own, as three buttons in one plain form (no script). The server
 * stores the choice and the page comes back already in that theme. Every word is a wording key.
 */
export function ThemeSwitch({ theme, back, t }: { theme: Theme; back: string; t: T }) {
  return (
    <form action={setTheme} role="group" aria-label={t("common.theme_toggle.theme")} className="flex flex-wrap gap-2">
      <input type="hidden" name="back" value={back} />
      {THEMES.map((option) => (
        <button
          key={option}
          type="submit"
          name="theme"
          value={option}
          aria-pressed={theme === option}
          data-theme-option={option}
          className={`inline-flex min-h-11 items-center rounded-button border px-4 text-button ${
            theme === option ? "border-fg bg-fg text-bg" : "border-line-strong hover:bg-surface-2"
          }`}
        >
          {t(LABEL[option])}
        </button>
      ))}
    </form>
  );
}
