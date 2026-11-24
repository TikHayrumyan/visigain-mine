import { Hero } from "@/components/home/hero/hero";
import { ReviewRatings } from "@/components/home/review-ratings/review-ratings";
import { AiVisibility } from "@/components/home/ai-visibility/ai-visibility";
import { KeyFeatures } from "@/components/home/key-features/key-features";
import { Testimonials } from "@/components/home/testimonials/testimonials";
import { HowItWorks } from "@/components/home/how-it-works/how-it-works";
import { WhoItsFor } from "@/components/home/who-its-for/who-its-for";
import { YouVsTop } from "@/components/home/you-vs-top/you-vs-top";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReviewRatings />
      <YouVsTop />
      <WhoItsFor />
      <AiVisibility />
      <KeyFeatures />
      <Testimonials />
      <HowItWorks />
      {/* TODO: the home page's sections; a placeholder until then, so the page scrolls past the hero. */}
      <div className="h-screen" />
    </>
  );
}
