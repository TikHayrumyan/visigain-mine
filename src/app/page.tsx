import { Hero } from "@/components/home/hero/hero";
import { ReviewRatings } from "@/components/home/review-ratings/review-ratings";
import { YouVsTop } from "@/components/home/you-vs-top/you-vs-top";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReviewRatings />
      <YouVsTop />
      {/* TODO: the home page's sections; a placeholder until then, so the page scrolls past the hero. */}
      <div className="h-screen" />
    </>
  );
}
