import type { Metadata } from "next";
import { ScanView } from "@/components/scan/scan-view";

export const metadata: Metadata = {
  title: "Free scan · Visigain",
};

/** Step 1. Every “Get Your Free Scan” button opens here. */
export default function ScanPage() {
  return <ScanView />;
}
