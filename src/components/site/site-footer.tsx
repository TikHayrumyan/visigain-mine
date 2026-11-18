import Link from "next/link";
import { Fragment } from "react";
import { ThemeSwitch } from "@/components/theme-switch";
import { loadCompany } from "@/site/company";
import type { Theme } from "@/theme/theme";
import type { T } from "@/wordings/t";
import { HomeLink } from "./home-link";
import { FOOTER_COMPANY, FOOTER_PRODUCT, FREE_SCAN_HREF, LEGAL_LINKS, type SiteLink } from "./links";

function Column({ t, heading, links }: { t: T; heading: string; links: readonly SiteLink[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-label-s text-faint">{t(heading)}</p>
      {links.map((link) => (
        <Link key={link.key} href={link.href} className="text-label-m text-fg no-underline hover:underline">
          {t(link.key)}
        </Link>
      ))}
    </div>
  );
}

/**
 * The dark footer on every page, held or not (the design's Footer, 1440 and 390): the logo, the Product and Company
 * columns, the legal links, and the company's facts from GET /about. The theme switch (not in the design) sits under
 * the logo. While the site is holding, the free scan, the theme switch and the company line (GET /about answers 404
 * then) are not drawn.
 */
export async function SiteFooter({ t, holding, theme, back }: { t: T; holding: boolean; theme: Theme; back: string }) {
  const company = holding ? null : await loadCompany();
  const product = holding ? FOOTER_PRODUCT.filter((link) => link.href !== FREE_SCAN_HREF) : FOOTER_PRODUCT;
  return (
    <footer data-theme="dark" data-testid="privacy-footer" className="border-t border-line bg-ink text-fg">
      <div className="mx-auto box-content flex max-w-content flex-col gap-8 px-5 pt-12 pb-10 lg:gap-10 lg:px-10 lg:pt-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6">
            <HomeLink t={t} />
            {holding ? null : <ThemeSwitch theme={theme} back={back} t={t} />}
          </div>
          <div className="flex gap-12 wrap-anywhere lg:gap-20">
            <Column t={t} heading="common.footer_columns.product" links={product} />
            <Column t={t} heading="common.footer_columns.company" links={FOOTER_COMPANY} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 text-body-s">
          <p className="flex flex-wrap items-center gap-2">
            {LEGAL_LINKS.map((link, i) => (
              <Fragment key={link.key}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-faint">
                    ·
                  </span>
                ) : null}
                <Link href={link.href} data-footer-link={link.key} className="text-muted no-underline hover:text-fg">
                  {t(link.key)}
                </Link>
              </Fragment>
            ))}
          </p>
          {company ? (
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <p className="flex items-start gap-1">
                <span className="text-muted">
                  {company.legalName} · {company.postalAddress} ·
                </span>
                <a href={`mailto:${company.publicEmail}`} className="text-fg no-underline hover:underline">
                  {company.publicEmail}
                </a>
              </p>
              <p className="text-faint">
                {t("common.footer.copyright", { year: String(new Date().getFullYear()), company: company.legalName })}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
