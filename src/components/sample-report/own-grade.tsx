import Link from "next/link";
import { HeroSurface } from "@/components/home/hero/hero-surface";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";

/** The closing card. The dotted field is the hero's, and it is not the page hero the compact header watches. */
export function OwnGrade() {
  return (
    <HeroSurface
      markHero={false}
      fadeDots={false}
      aria-labelledby="sample-own-grade"
      className="relative overflow-hidden rounded-panel"
      panelClassName="absolute inset-0 overflow-hidden rounded-panel bg-ink"
    >
      <div
        data-theme="dark"
        className="relative z-10 flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:gap-6 lg:p-14"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id="sample-own-grade" className="font-display text-headline-m text-fg">
            This was a sample
          </h2>
          <p className="text-body-m text-muted">
            A Full Report lists every finding, each with its evidence and its exact fix.
          </p>
        </div>
        <Link href={FREE_SCAN.href} className={`${PRIMARY_BUTTON} h-12 w-full px-6 lg:w-auto`}>
          {FREE_SCAN.label}
        </Link>
      </div>
    </HeroSurface>
  );
}
