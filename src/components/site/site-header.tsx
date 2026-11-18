import Image from "next/image";
import Link from "next/link";
import { AppLink } from "@/components/app-link";
import { accountLink } from "@/site/account";
import type { T } from "@/wordings/t";
import arrowIcon from "./assets/arrow-right.svg";
import { DECORATIVE_ALT } from "./decorative";
import { HomeLink } from "./home-link";
import { FREE_SCAN_HREF, PRIMARY_NAV, SECONDARY_NAV } from "./links";
import { MobileMenu } from "./mobile-menu";

const FREE_SCAN_BUTTON =
  "inline-flex items-center justify-center rounded-button bg-green px-5 text-label-l text-ink no-underline hover:bg-green-dark";

/**
 * The header, on the dark panel at the top of a page (the design's Header, 1440 and 390). On a wide screen: the logo,
 * the three page links and "Get Your Free Scan"; on a phone: the logo and the menu button. While the site is holding,
 * the free scan and "Log in" are not drawn.
 */
export async function SiteHeader({ t, holding }: { t: T; holding: boolean }) {
  const account = await accountLink(holding);
  return (
    <header className="mx-auto box-content flex max-w-content items-center justify-between px-4 pt-5 pb-3 lg:px-6 lg:pt-10 lg:pb-5">
      <HomeLink t={t} className="w-32.75 lg:w-41" />

      <nav aria-label={t("site.home.main")} className="hidden items-center gap-7 lg:flex">
        {PRIMARY_NAV.map((link) => (
          <Link key={link.key} href={link.href} className="text-label-m text-fg no-underline hover:underline">
            {t(link.key)}
          </Link>
        ))}
        {holding ? null : (
          <Link href={FREE_SCAN_HREF} className={`${FREE_SCAN_BUTTON} h-11`}>
            {t("common.nav.get_your_free_scan")}
          </Link>
        )}
      </nav>

      <MobileMenu openLabel={t("common.shared.menu")} closeLabel={t("common.cookie_banner.close")}>
        <div className="px-4 pt-5 pb-3">
          <div className="flex h-11.5 items-center">
            <HomeLink t={t} className="w-32.75" />
          </div>
        </div>
        <nav aria-label={t("site.home.main")}>
          <ul className="px-6 pt-6">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="flex h-16 items-center justify-between text-headline-s text-fg no-underline"
                >
                  {t(link.key)}
                  <Image src={arrowIcon} alt={DECORATIVE_ALT} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {account ? (
          <p className="flex gap-2 px-6 pt-5 text-label-m">
            {account.signedIn ? null : <span className="text-muted">{t("common.nav.already_a_customer")}</span>}
            <AppLink href={account.href} className="text-fg no-underline hover:underline">
              {t(account.key)}
            </AppLink>
          </p>
        ) : null}
        {holding ? null : (
          <div className="mt-auto flex flex-col items-center gap-3 px-6 pt-4 pb-6">
            <Link href={FREE_SCAN_HREF} className={`${FREE_SCAN_BUTTON} h-13 w-full`}>
              {t("common.nav.get_your_free_scan")}
            </Link>
            <p className="text-body-s text-muted">{t("common.nav.free_no_call_results_in_about")}</p>
          </div>
        )}
      </MobileMenu>
    </header>
  );
}
