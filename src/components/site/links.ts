/** The site's own links, by the wording key of their words. The header, the open menu and the footer share them. */
export interface SiteLink {
  key: string;
  href: string;
}

/** The free scan: hidden while the site is holding. */
export const FREE_SCAN_HREF = "/scan";

export const PRIMARY_NAV: readonly SiteLink[] = [
  { key: "common.nav.how_it_works", href: "/#how-it-works" },
  { key: "common.nav.pricing", href: "/pricing" },
  { key: "common.footer_columns.sample_report", href: "/sample-report" },
];

export const SECONDARY_NAV: readonly SiteLink[] = [
  { key: "common.nav.help_center", href: "/faq" },
  { key: "common.footer_columns.contact", href: "/contact" },
  { key: "common.nav.blog", href: "/articles" },
];

export const FOOTER_PRODUCT: readonly SiteLink[] = [
  { key: "common.footer_columns.free_scan", href: FREE_SCAN_HREF },
  { key: "common.footer_columns.full_visibility_grade_report", href: "/pricing" },
  { key: "common.footer_columns.monitoring", href: "/pricing" },
  { key: "common.footer_columns.sample_report", href: "/sample-report" },
];

export const FOOTER_COMPANY: readonly SiteLink[] = [
  { key: "common.footer_columns.pricing", href: "/pricing" },
  { key: "common.footer_columns.contact", href: "/contact" },
  { key: "common.nav.blog", href: "/articles" },
  { key: "common.footer_columns.faq", href: "/faq" },
];

/**
 * The legal links, by the backend's footer's own keys. "Your Privacy Choices" and "Cookie settings" must be on every
 * page (the Privacy Policy and the Cookie Policy name them; one choice covers the website, the app and admin), both to
 * this site's /privacy-choices.
 */
export const LEGAL_LINKS: readonly SiteLink[] = [
  { key: "common.legal_links.privacy_policy", href: "/privacy" },
  { key: "common.legal_links.terms_of_service", href: "/terms" },
  { key: "common.legal_links.refund_policy", href: "/refunds" },
  { key: "common.legal_links.cookie_policy", href: "/cookies" },
  { key: "common.legal_links.cookie_settings", href: "/privacy-choices" },
  { key: "common.legal_links.accessibility", href: "/accessibility" },
  { key: "common.legal_links.your_privacy_choices", href: "/privacy-choices" },
];
