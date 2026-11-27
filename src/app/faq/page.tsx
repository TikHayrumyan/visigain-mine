import type { Metadata } from "next";
import { FaqTitle } from "@/components/faq/faq-title";
import { Cta } from "@/components/home/cta/cta";
import { Faq } from "@/components/home/faq/faq";
import { QUESTIONS } from "@/components/home/faq/questions";
import { liveFaq } from "@/lib/api/faq";

export const metadata: Metadata = {
  title: "Frequently asked questions · Visigain",
};

/** The standalone FAQ: the same header, list, scan panel and footer as Home, with its own title. */
export default async function FaqPage() {
  const questions = (await liveFaq()) ?? QUESTIONS;

  return (
    <>
      <FaqTitle />
      <Faq layout="stack" questions={questions} />
      <Cta />
    </>
  );
}
