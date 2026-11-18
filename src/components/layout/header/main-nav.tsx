import Link from "next/link";
import { FreeScanLink } from "@/components/ui/free-scan-link";
import { PRIMARY_NAV } from "@/config/navigation";

/** The wide screen's main links and the free scan button, in the header and in the compact header. */
export function MainNav() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
      {PRIMARY_NAV.map((link) => (
        <Link key={link.href} href={link.href} className="text-label-m text-fg no-underline hover:underline">
          {link.label}
        </Link>
      ))}
      <FreeScanLink className="h-11" />
    </nav>
  );
}
