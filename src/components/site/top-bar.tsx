import Link from "next/link";
import { AppLink } from "@/components/app-link";
import { accountLink } from "@/site/account";
import type { T } from "@/wordings/t";
import { SECONDARY_NAV } from "./links";

const LINK = "text-muted no-underline hover:text-fg";

/** The thin bar above the header on a wide screen (the design's Top bar / Secondary nav): the account link, then help. */
export async function TopBar({ t, holding }: { t: T; holding: boolean }) {
  const account = await accountLink(holding);
  return (
    <div className="mx-auto box-content hidden h-10 max-w-content items-center justify-end gap-6 px-10 text-label-s lg:flex">
      {account ? (
        <AppLink href={account.href} className={LINK}>
          {t(account.key)}
        </AppLink>
      ) : null}
      {SECONDARY_NAV.map((link) => (
        <Link key={link.key} href={link.href} className={LINK}>
          {t(link.key)}
        </Link>
      ))}
    </div>
  );
}
