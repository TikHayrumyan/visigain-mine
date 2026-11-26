import type { Metadata } from "next";
import { SampleHero } from "@/components/sample-report/sample-hero";
import { SampleReport } from "@/components/sample-report/sample-report";

export const metadata: Metadata = {
  title: "Sample report · Visigain",
};

/** A fixed sample of a full report. Nothing is fetched. */
export default function SampleReportPage() {
  return (
    <>
      <SampleHero />
      <SampleReport />
    </>
  );
}
