import Link from "next/link";
import { Fragment } from "react";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { COMPANY, FOOTER_COLUMNS, LEGAL_LINKS } from "@/config/navigation";
import type { Theme } from "@/lib/theme/theme";
import { LogoLink } from "../logo-link";

/** The dark footer on every page (dark in both themes). The theme switch sits under the logo. */
export function Footer({ theme }: { theme: Theme }) {
  return (
    <footer data-theme="dark" className="border-t border-line bg-ink text-fg">
      <div className="mx-auto box-content flex max-w-content flex-col gap-8 px-5 pt-12 pb-10 lg:gap-10 lg:px-10 lg:pt-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6">
            <LogoLink />
            <ThemeSwitch theme={theme} />
          </div>
          <div className="flex gap-12 lg:gap-20">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <p className="text-label-s text-faint">{column.title}</p>
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="text-label-m text-fg no-underline hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 text-body-s">
          <p className="flex flex-wrap items-center gap-2">
            {LEGAL_LINKS.map((link, i) => (
              <Fragment key={link.label}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-faint">
                    ·
                  </span>
                ) : null}
                <Link href={link.href} className="text-muted no-underline hover:text-fg">
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </p>
          <div className="flex flex-col lg:flex-row lg:justify-between">
            <p className="flex items-start gap-1">
              <span className="text-muted">
                {COMPANY.legalName} · {COMPANY.address} ·
              </span>
              <a href={`mailto:${COMPANY.email}`} className="text-fg no-underline hover:underline">
                {COMPANY.email}
              </a>
            </p>
            <p className="text-faint">
              © {new Date().getFullYear()} {COMPANY.legalName}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
