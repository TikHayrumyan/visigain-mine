import type { T } from "@/wordings/t";

/**
 * The two links every page's footer must carry (the Privacy Policy and the Cookie Policy name them; the Cookie Policy
 * of v3.18 says one choice covers the website, the app and admin and can be changed on any of
 * them): "Your Privacy Choices" and "Cookie settings", by the backend's footer's own keys, both to this site's
 * /privacy-choices (as the backend's LEGAL_LINKS). The designed footer keeps both; this is the minimum until it exists.
 */
export const PRIVACY_FOOTER_LINKS = [
  { key: "common.legal_links.your_privacy_choices", href: "/privacy-choices" },
  { key: "common.legal_links.cookie_settings", href: "/privacy-choices" },
] as const;

export function PrivacyFooter({ t }: { t: T }) {
  return (
    <footer className="mx-auto flex max-w-site flex-wrap gap-stack px-4 py-4 text-muted" data-testid="privacy-footer">
      {PRIVACY_FOOTER_LINKS.map((l) => (
        <a key={l.key} href={l.href} data-footer-link={l.key}>
          {t(l.key)}
        </a>
      ))}
    </footer>
  );
}
