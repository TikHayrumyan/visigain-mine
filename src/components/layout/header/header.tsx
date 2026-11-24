import Image from "next/image";
import Link from "next/link";
import { FreeScanLink } from "@/components/ui/free-scan-link";
import { LOGIN, MOBILE_NAV } from "@/config/navigation";
import { LogoLink } from "../logo-link";
import { CompactHeader } from "./compact-header";
import { MainNav } from "./main-nav";
import { MenuButton, MobileMenu } from "./mobile-menu";

/**
 * The header: transparent, laid over the top of every page's dark hero (so it is dark-themed too). Wide screen: the
 * logo, the page links and the free scan button; phone: the logo and the menu button. On both, the compact header
 * once the hero is scrolled past.
 */
export function Header() {
  return (
    <header data-theme="dark" className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex w-full max-w-360 items-center justify-between px-6 pt-5.5 pb-3 lg:px-30 lg:pt-10 lg:pb-5">
        <LogoLink className="w-32.75 lg:w-41" />
        <MainNav />
        <MenuButton />

        <CompactHeader>
          <LogoLink tone="dark" className="w-32.75 lg:w-41" />
          <MainNav />
          <MenuButton tone="dark" />
        </CompactHeader>

        <MobileMenu>
          <div className="px-4 pt-5 pb-3">
            <div className="flex h-11.5 items-center">
              <LogoLink className="w-32.75" />
            </div>
          </div>
          <nav aria-label="Main">
            <ul className="px-6 pt-6">
              {MOBILE_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex h-16 items-center justify-between text-headline-s text-fg no-underline"
                  >
                    {link.label}
                    <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="flex gap-2 px-6 pt-5 text-label-m">
            <span className="text-muted">Already a customer?</span>
            <Link href={LOGIN.href} className="text-fg no-underline hover:underline">
              {LOGIN.label}
            </Link>
          </p>
          <div className="mt-auto flex flex-col items-center gap-3 px-6 pt-4 pb-6">
            <FreeScanLink className="h-13 w-full" />
            <p className="text-body-s text-muted">Free · No call · Results in about 15 minutes</p>
          </div>
        </MobileMenu>
      </div>
    </header>
  );
}
