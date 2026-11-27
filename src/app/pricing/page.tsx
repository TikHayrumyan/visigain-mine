import type { Metadata } from "next";
import { Cta } from "@/components/home/cta/cta";
import { Faq } from "@/components/home/faq/faq";
import { PRICING_QUESTIONS } from "@/components/home/faq/questions";
import { Included } from "@/components/pricing/included";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { Refunds } from "@/components/pricing/refunds";
import { livePricing } from "@/lib/api/pricing";

export const metadata: Metadata = {
  title: "Pricing · Visigain",
};

/** Plans, what each one includes, the refund rules, and the pricing questions. */
export default async function PricingPage() {
  const pricing = await livePricing();

  return (
    <>
      <PricingHero pricing={pricing} />
      <Included prices={pricing ?? undefined} />
      <Refunds />
      <Faq
        questions={pricing?.questions ?? PRICING_QUESTIONS}
        heading="Questions about pricing"
        action={{ href: "/faq", label: "All questions" }}
      />
      <Cta />
    </>
  );
}
