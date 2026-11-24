import Link from "next/link";
import { LOGIN, SECONDARY_NAV } from "@/config/navigation";

/** The thin bar above the header on a wide screen. */
export function TopBar() {
  return (
    <nav
      aria-label="Secondary"
      className="mx-auto hidden h-10 w-full max-w-360 items-center justify-end gap-6 px-30 text-label-s lg:flex"
    >
      {[LOGIN, ...SECONDARY_NAV].map((link) => (
        <Link key={link.href} href={link.href} className="text-muted no-underline hover:text-fg">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
