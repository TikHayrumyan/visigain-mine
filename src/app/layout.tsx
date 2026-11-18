import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import "./globals.css";
import { BRAND } from "@/brand/tokens";
import { HoldingPage } from "@/components/holding-page";
import { SiteFooter } from "@/components/site/site-footer";
import { TopBar } from "@/components/site/top-bar";
import { PATH_HEADER } from "@/site/path";
import { showsHoldingPage } from "@/site/holding";
import { loadSite } from "@/site/server";
import { currentTheme } from "@/theme/server";
import { getT } from "@/wordings/server";

/*
 * The fonts come from the font files of the @fontsource packages (SIL Open Font License), served from this site: no
 * request goes to Google, at build time or from a visitor's browser.
 */

/** Geist, the website design's text face (400 body, 500 labels and buttons). */
const geist = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/geist/files/geist-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/geist/files/geist-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-geist",
});

/** Poppins, the brand's display face (400 to 800), the same files and weights as the backend. */
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
 * The root layout: the theme (from the vg_theme cookie, so the first paint is right), the top bar, the footer, and the
 * holding page in place of the page while GET /api/v1/site says `holding` (except on `holdingPages`). The header sits
 * on each page's own dark panel, so a page draws it (src/components/site/site-header.tsx). The footer, with "Your
 * Privacy Choices" and "Cookie settings", is on every page, held or not; while holding it draws no theme switch (as on
 * the backend: no form is sent from a held site but the contact form).
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, theme, t, incoming] = await Promise.all([loadSite(), currentTheme(), getT(), headers()]);
  const path = incoming.get(PATH_HEADER) ?? "/";
  const held = showsHoldingPage(site, path);
  return (
    <html
      lang="en"
      className={`${geist.variable} ${poppins.variable}`}
      {...(theme === "system" ? {} : { "data-theme": theme })}
    >
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <TopBar t={t} holding={site.holding} />
        {held ? <HoldingPage t={t} /> : children}
        <SiteFooter t={t} holding={site.holding} theme={theme} back={path} />
      </body>
    </html>
  );
}
