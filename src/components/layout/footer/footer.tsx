"use client";

import Link from "next/link";
import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { COMPANY, FOOTER_COLUMNS, LEGAL_LINKS } from "@/config/navigation";
import { LogoLink } from "../logo-link";

/** The footer fades in over the last 0.7s of the homepage timeline (44.3–45.0s). */
const REVEAL_SECONDS = 0.7;
const REVEAL_EASE = [0, 0, 0.58, 1] as const;

/** The dark footer on every page. It stays dark in both themes. */
export function Footer({
  company = COMPANY,
}: {
  company?: { legalName: string; address: string; email: string };
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.footer
      data-theme="dark"
      className="border-t border-line bg-ink text-fg"
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={reduceMotion ? { duration: 0 } : { duration: REVEAL_SECONDS, ease: REVEAL_EASE }}
    >
      <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-5 pt-12 pb-10 lg:gap-10 lg:px-30 lg:pt-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <LogoLink />
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
            {LEGAL_LINKS.map((link, index) => (
              <Fragment key={link.label}>
                {index > 0 ? (
                  <span aria-hidden className="text-faint">
                    ·
                  </span>
                ) : null}
                <Link href={link.href} className="text-muted no-underline hover:text-fg">
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-0">
            <p className="flex flex-wrap gap-x-1">
              <span className="text-muted">
                {company.legalName} · {company.address} ·
              </span>
              <a href={`mailto:${company.email}`} className="text-fg no-underline hover:underline">
                {company.email}
              </a>
            </p>
            <p className="text-faint">© 2026 {company.legalName}</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
