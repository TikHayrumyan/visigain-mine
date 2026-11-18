import { setTheme } from "@/lib/theme/actions";
import { THEMES, type Theme } from "@/lib/theme/theme";

const LABEL: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/** Light, dark or the device's own: three buttons in one plain form (works without JavaScript). */
export function ThemeSwitch({ theme }: { theme: Theme }) {
  return (
    <form action={setTheme} role="group" aria-label="Theme" className="flex flex-wrap gap-2">
      {THEMES.map((option) => (
        <button
          key={option}
          type="submit"
          name="theme"
          value={option}
          aria-pressed={theme === option}
          className={`inline-flex min-h-11 items-center rounded-button border px-4 text-label-m ${
            theme === option ? "border-fg bg-fg text-bg" : "border-line-strong hover:bg-surface-2"
          }`}
        >
          {LABEL[option]}
        </button>
      ))}
    </form>
  );
}
