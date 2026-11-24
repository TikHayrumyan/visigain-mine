"use client";

import type { ReactNode } from "react";
import { useScrolledPast } from "@/hooks/use-scrolled-past";

/** Where the pill ends on a wide screen: 20px from the top plus its 70px height. */
const PILL_BOTTOM = 90;

/**
 * The compact header: a white pill fixed near the top (8px on a phone, 20px on a wide screen). It fades in and slides
 * down 24px once the hero's dark panel (the element marked `data-hero`) has scrolled up under it, and leaves when the
 * panel is back.
 */
export function CompactHeader({ children }: { children: ReactNode }) {
  const shown = useScrolledPast("[data-hero]", PILL_BOTTOM);

  return (
    <div
      data-theme="light"
      inert={!shown}
      className={`fixed inset-x-0 top-2 z-20 px-2 transition-[opacity,translate] duration-500 ease-reveal lg:top-5 lg:px-10 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-6 opacity-0"
      }`}
    >
      <div className="mx-auto flex h-15 max-w-content items-center z-999 relative justify-between rounded-pill border border-line bg-surface pr-2 pl-4 text-fg shadow-pill lg:h-17.5 lg:pr-3 lg:pl-6">
        {children}
      </div>
    </div>
  );
}
