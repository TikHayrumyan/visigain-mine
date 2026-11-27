import type { Metadata } from "next";
import { AboutBody } from "@/components/about/about-body";
import { AboutHero } from "@/components/about/about-hero";
import { Cta } from "@/components/home/cta/cta";
import { aboutContent } from "@/lib/api/about";

export const metadata: Metadata = {
  title: "About · Visigain",
};

/** The company page: the same dark title, narrow card and closing scan as the other pages. */
export default async function AboutPage() {
  const about = await aboutContent();

  return (
    <>
      <AboutHero lead={about.lead} />
      <AboutBody about={about} />
      <Cta />
    </>
  );
}
