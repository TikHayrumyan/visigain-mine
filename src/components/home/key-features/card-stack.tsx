"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Children, useEffect, useRef, type ReactNode } from "react";

/** The card list, unchanged: 20px between rows on a phone, 40px on a wide screen. */
const LIST = "mx-auto mt-8 flex w-full max-w-270 flex-col gap-5 px-4 lg:mt-10 lg:gap-10 lg:px-0";

/**
 * The six feature rows stick under the header and stack as the page scrolls.
 * The row behind scales to 0.96 and peeks 24px (16px on a phone); the one behind that
 * scales to 0.92 and peeks twice that. Only three rows stay visible. The last row
 * takes the stack away with the section.
 */
export function CardStack({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const peek = usePeek();
  const items = Children.toArray(children);

  if (reduceMotion) return <div className={LIST}>{children}</div>;

  return (
    <div ref={ref} className={LIST}>
      {items.map((item, index) => (
        <StackedRow key={index} index={index} count={items.length} progress={scrollYProgress} peek={peek}>
          {item}
        </StackedRow>
      ))}
    </div>
  );
}

function usePeek() {
  const peek = useMotionValue(16);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const apply = () => peek.set(query.matches ? 24 : 16);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [peek]);
  return peek;
}

function StackedRow({
  index,
  count,
  progress,
  peek,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  peek: MotionValue<number>;
  children: ReactNode;
}) {
  const step = 1 / count;
  const start = index * step;
  const depth = Math.min(2, count - 1 - index);
  const scale = useTransform(progress, (value) => {
    if (depth === 0 || value <= start) return 1;
    const hop = Math.min((value - start) / step, depth);
    return 1 - hop * 0.04;
  });
  const y = useTransform([progress, peek], ([value, peekPx]) => {
    if (depth === 0) return 0;
    const current = Number(value);
    if (current <= start) return 0;
    const hop = Math.min((current - start) / step, depth);
    return -hop * Number(peekPx);
  });
  const opacity = useTransform(progress, (value) => {
    if (index + 3 >= count || value <= start + step * 2) return 1;
    const fade = (value - (start + step * 2)) / step;
    return Math.max(0, 1 - fade);
  });

  return (
    <div className="sticky top-32 w-full lg:top-37.5" style={{ zIndex: index + 1 }}>
      <motion.div style={{ scale, y, opacity, transformOrigin: "top center" }}>{children}</motion.div>
    </div>
  );
}
