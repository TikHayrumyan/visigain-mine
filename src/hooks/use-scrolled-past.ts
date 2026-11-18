"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Whether the page's element matching `selector` has scrolled up past a line `offset` pixels below the top of the
 * screen. Looks the element up again on every page, since the layout that uses it stays mounted across navigations.
 */
export function useScrolledPast(selector: string, offset = 0): boolean {
  const pathname = usePathname();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const target = document.querySelector(selector);
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: `-${offset}px 0px 0px 0px` },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      setPast(false);
    };
  }, [selector, offset, pathname]);

  return past;
}
