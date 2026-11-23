"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useRef, type ComponentProps, type PointerEvent } from "react";
import styles from "./hero.module.css";

/** How the green spot trails the pointer: quick, without overshoot. */
const SPRING = { stiffness: 400, damping: 40, mass: 0.4 };

interface HeroSurfaceProps extends ComponentProps<"section"> {
  /** The dark dotted panel's size and shape. */
  panelClassName: string;
}

/**
 * The hero's section with its dark dotted panel (marked `data-hero` for the compact header). While a mouse is over the
 * section, the dots turn green in a soft circle that follows it. The dots are one tiled background, and the circle moves
 * through motion values, so following the pointer never re-renders React.
 */
export function HeroSurface({ panelClassName, className = "", children, ...props }: HeroSurfaceProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const mask = useMotionTemplate`radial-gradient(180px circle at ${x}px ${y}px, black 35%, transparent)`;

  const track = (event: PointerEvent, jump: boolean) => {
    const panel = panelRef.current;
    if (!panel || event.pointerType === "touch") return;
    const { left, top } = panel.getBoundingClientRect();
    const [nextX, nextY] = [event.clientX - left, event.clientY - top];
    if (jump) {
      x.jump(nextX);
      y.jump(nextY);
    } else {
      x.set(nextX);
      y.set(nextY);
    }
  };

  return (
    <section
      {...props}
      className={`group ${className}`}
      onPointerEnter={(event) => track(event, true)}
      onPointerMove={(event) => track(event, false)}
    >
      <div ref={panelRef} data-hero aria-hidden data-theme="dark" className={panelClassName}>
        <div className={styles.fade}>
          <div className={styles.dots} />
          <motion.div
            className={`${styles.greenDots} opacity-0 transition-opacity duration-500 ease-reveal group-hover:opacity-100`}
            style={{ maskImage: mask }}
          />
        </div>
      </div>
      {children}
    </section>
  );
}
