import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = { light: "/icons/logo.svg", dark: "/icons/logo-dark.svg" } as const;

/**
 * The logo, linking home. `tone` is the logo's colour: light on a dark surface, dark on a light one. `className` sets
 * its width (164 by default; the phone's header draws it 131 wide).
 */
export function LogoLink({ tone = "light", className = "w-41" }: { tone?: keyof typeof LOGO_SRC; className?: string }) {
  return (
    <Link href="/" aria-label="Visigain home" className="shrink-0">
      <Image src={LOGO_SRC[tone]} alt="" width={164} height={32} className={`h-auto ${className} `} />
    </Link>
  );
}
