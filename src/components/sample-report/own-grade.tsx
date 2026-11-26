import Link from "next/link";
import styles from "@/components/home/hero/hero.module.css";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";

/** The closing card. There is no separate call-to-action section on this page. */
export function OwnGrade() {
  return (
    <div className="relative overflow-hidden rounded-panel bg-ink">
      <div aria-hidden data-theme="dark" className="pointer-events-none absolute inset-0">
        <div className={styles.fade}>
          <div className={styles.dots} />
          <div className={`${styles.greenDots} opacity-70`} />
        </div>
      </div>
      <div
        data-theme="dark"
        className="relative flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:gap-6 lg:p-14"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-display text-headline-m text-fg">This was a sample</h2>
          <p className="text-body-m text-muted">
            A Full Report lists every finding, each with its evidence and its exact fix.
          </p>
        </div>
        <Link href={FREE_SCAN.href} className={`${PRIMARY_BUTTON} h-12 w-full px-6 lg:w-auto`}>
          {FREE_SCAN.label}
        </Link>
      </div>
    </div>
  );
}
