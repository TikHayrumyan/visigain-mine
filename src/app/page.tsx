import { Hero } from "@/components/home/hero/hero";
import { placeSearchSettings } from "@/lib/api/place-search";
import { ReviewRatings } from "@/components/home/review-ratings/review-ratings";
import { AiVisibility } from "@/components/home/ai-visibility/ai-visibility";
import { KeyFeatures } from "@/components/home/key-features/key-features";
import { Testimonials } from "@/components/home/testimonials/testimonials";
import { HowItWorks } from "@/components/home/how-it-works/how-it-works";
import { PLANS, withApiPrices } from "@/components/home/plans/catalog";
import { Plans } from "@/components/home/plans/plans";
import { livePricing } from "@/lib/api/pricing";
import { Faq } from "@/components/home/faq/faq";
import { Cta } from "@/components/home/cta/cta";
import { WhoItsFor } from "@/components/home/who-its-for/who-its-for";
import { YouVsTop } from "@/components/home/you-vs-top/you-vs-top";

export default async function HomePage() {
  const [search, pricing] = await Promise.all([placeSearchSettings(), livePricing()]);

  return (
    <>
      <Hero search={search} />
      <ReviewRatings />
      <YouVsTop />
      <WhoItsFor />
      <AiVisibility />
      <KeyFeatures />
      <Testimonials />
      <HowItWorks />
      <Plans plans={pricing ? withApiPrices(PLANS, pricing) : PLANS} />
      <Faq />
      <Cta search={search} />
    </>
  );
}
