import Image from "next/image";
import Link from "next/link";
import type { T } from "@/wordings/t";
import logo from "./assets/logo.svg";
import { DECORATIVE_ALT } from "./decorative";

/** The logo, linking home. `className` sets its width (164 by default; the phone's header draws it 131 wide). */
export function HomeLink({ t, className = "w-41" }: { t: T; className?: string }) {
  return (
    <Link href="/" aria-label={t("site.kit.home")} className="shrink-0">
      <Image src={logo} alt={DECORATIVE_ALT} className={`h-auto ${className}`} />
    </Link>
  );
}
