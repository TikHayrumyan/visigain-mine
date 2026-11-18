import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/layout/footer/footer";
import { Header } from "@/components/layout/header/header";
import { TopBar } from "@/components/layout/top-bar";
import { currentTheme } from "@/lib/theme/server";
import { BRAND } from "@/styles/tokens";

/** Geist, the text face (400 body, 500 labels and buttons), self-hosted from @fontsource. */
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

/** Poppins, the display face (400 to 800), self-hosted from @fontsource. */
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

export const metadata: Metadata = {
  title: "Visigain: the Visibility Grade for local businesses",
};

export const viewport: Viewport = { themeColor: BRAND.ink, colorScheme: "light dark" };

/**
 * The root layout: the theme from the cookie (so the first paint is right), the top bar, the header laid over the
 * page's hero, and the footer.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await currentTheme();
  return (
    <html
      lang="en"
      className={`${geist.variable} ${poppins.variable}`}
      {...(theme === "system" ? {} : { "data-theme": theme })}
    >
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <TopBar />
        <div className="relative">
          <Header />
          {children}
        </div>
        <Footer theme={theme} />
      </body>
    </html>
  );
}
