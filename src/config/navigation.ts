export interface NavLink {
  label: string;
  href: string;
}

export const FREE_SCAN: NavLink = { label: "Get Your Free Scan", href: "/scan" };
export const LOGIN: NavLink = { label: "Log in", href: "/login" };

export const PRIMARY_NAV: readonly NavLink[] = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Sample report", href: "/sample-report" },
];

const HELP_CENTER: NavLink = { label: "Help center", href: "/faq" };
export const CONTACT: NavLink = { label: "Contact", href: "/contact" };
const BLOG: NavLink = { label: "Blog", href: "/blog" };

/** The top bar's links (after Log in). */
export const SECONDARY_NAV: readonly NavLink[] = [HELP_CENTER, CONTACT, BLOG];

/** The phone's menu: it has no top bar, so its links are here too, in the design's order. */
export const MOBILE_NAV: readonly NavLink[] = [...PRIMARY_NAV, BLOG, HELP_CENTER, CONTACT];

export const FOOTER_COLUMNS: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Free Scan", href: "/scan" },
      { label: "Full Visibility Grade Report", href: "/pricing" },
      { label: "Monitoring", href: "/pricing" },
      { label: "Sample report", href: "/sample-report" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export const LEGAL_LINKS: readonly NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refunds" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Cookie settings", href: "/privacy-choices" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Your Privacy Choices", href: "/privacy-choices" },
];

export const COMPANY = {
  legalName: "Visigain LLC",
  address: "453 S. Spring St, Suite 1212, Los Angeles, CA 90013",
  email: "info@visigain.com",
} as const;
