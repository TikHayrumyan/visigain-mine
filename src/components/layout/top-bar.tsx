import Link from "next/link";
import { LOGIN, SECONDARY_NAV } from "@/config/navigation";

/** The thin bar above the header on a wide screen. */
export function TopBar() {
  return (
    <nav
      aria-label="Secondary"
      className="mx-auto box-content hidden h-10 max-w-content items-center justify-end gap-6 px-10 text-label-s lg:flex"
    >
      {[LOGIN, ...SECONDARY_NAV].map((link) => (
        <Link key={link.href} href={link.href} className="text-muted no-underline hover:text-fg">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
