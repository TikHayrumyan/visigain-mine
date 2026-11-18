import Link from "next/link";
import { FREE_SCAN } from "@/config/navigation";
import { PRIMARY_BUTTON } from "./button-styles";

/** The green "Get Your Free Scan" button. `className` sets its size. */
export function FreeScanLink({ className = "" }: { className?: string }) {
  return (
    <Link href={FREE_SCAN.href} className={`${PRIMARY_BUTTON} px-5 ${className}`}>
      {FREE_SCAN.label}
    </Link>
  );
}
