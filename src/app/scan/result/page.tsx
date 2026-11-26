import { Suspense } from "react";
import type { Metadata } from "next";
import { Result } from "@/components/scan/result";

export const metadata: Metadata = {
  title: "Free grade · Visigain",
};

/** Step 3. The same address opens from the email link, once a mailer exists. */
export default function ResultPage() {
  return (
    <Suspense>
      <Result />
    </Suspense>
  );
}
