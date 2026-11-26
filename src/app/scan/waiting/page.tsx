import { Suspense } from "react";
import type { Metadata } from "next";
import { Waiting } from "@/components/scan/waiting";

export const metadata: Metadata = {
  title: "Grading · Visigain",
};

/** Step 2, shown right after the form. */
export default function WaitingPage() {
  return (
    <Suspense>
      <Waiting />
    </Suspense>
  );
}
