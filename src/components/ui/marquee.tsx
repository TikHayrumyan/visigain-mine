"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./marquee.module.css";

/** Magic UI's infinite row. `speed` is pixels per second; `reverse` runs the row the other way. */
export function Marquee({
  children,
  reverse = false,
  pauseOnHover = false,
  speed = 60,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = track.current;
    if (!row) return;
    row.parentElement?.style.setProperty("--duration", `${row.scrollWidth / speed}s`);
  }, [speed]);

  return (
    <div className={cn("flex overflow-hidden", pauseOnHover && styles.pause, className)}>
      <div ref={track} className={cn(styles.track, reverse && styles.reverse)}>
        {children}
      </div>
      <div aria-hidden className={cn(styles.track, reverse && styles.reverse)}>
        {children}
      </div>
    </div>
  );
}
