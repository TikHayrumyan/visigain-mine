import type { AnchorHTMLAttributes, ReactNode } from "react";
import { appHref } from "@/site/referral-server";

/**
 * A link to the customer app (APP_ORIGIN, src/site/referral.ts): the scan result's "Get the Full Report" and "Monitoring" buttons,
 * the header's "Dashboard", any address on the app's host. A server component: it reads the visitor's `vg_ref` here
 * and adds it to the address (src/site/referral.ts), so the app's checkout credits the referral. Every link to the app
 * goes through it (tests/referral.test.tsx holds that no other place in src writes the app's address).
 */
export async function AppLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const to = await appHref(href);
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}
