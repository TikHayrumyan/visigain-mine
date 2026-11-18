import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import "./globals.css";
import { BRAND } from "@/brand/tokens";
import { HoldingPage } from "@/components/holding-page";
import { PrivacyFooter } from "@/components/privacy-footer";
import { ThemeSwitch } from "@/components/theme-switch";
import { PATH_HEADER } from "@/site/path";
import { showsHoldingPage } from "@/site/holding";
import { loadSite } from "@/site/server";
import { currentTheme } from "@/theme/server";
import { getT } from "@/wordings/server";

/**
 * Poppins, the brand's one typeface (400 body, 500 small UI, 600 UI, 700 subheads, 800 display), from the font files
 * of the @fontsource/poppins package (SIL Open Font License), served from this site: no request goes to Google, at
 * build time or from a visitor's browser. The same files and weights as the backend.
 */
const poppins = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("site.home.visigain_the_visibility_grade_for_local") };
}

export const viewport: Viewport = { themeColor: BRAND.ink, colorScheme: "light dark" };

/**
 * The root layout: the theme (from the vg_theme cookie, so the first paint is right), the theme switch, and the
 * holding page in place of the page while GET /api/v1/site says `holding` (except on `holdingPages`). While holding,
 * the theme switch is not drawn (as on the backend: no form is sent from a held site but the contact form). The footer
 * with "Your Privacy Choices" and "Cookie settings" is on every page, held or not.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, theme, t, incoming] = await Promise.all([loadSite(), currentTheme(), getT(), headers()]);
  const path = incoming.get(PATH_HEADER) ?? "/";
  const held = showsHoldingPage(site, path);
  return (
    <html lang="en" className={poppins.variable} {...(theme === "system" ? {} : { "data-theme": theme })}>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        {/* {site.holding ? null : (
          <header className="mx-auto flex max-w-site justify-end px-4 py-4">
            <ThemeSwitch theme={theme} back={path} t={t} />
          </header>
        )} */}
        {held ? <HoldingPage t={t} /> : children}
        {/* <PrivacyFooter t={t} /> */}
      </body>
    </html>
  );
}
