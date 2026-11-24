import type { Metadata } from "next";
import { FaqTitle } from "@/components/faq/faq-title";
import { Cta } from "@/components/home/cta/cta";
import { Faq } from "@/components/home/faq/faq";

export const metadata: Metadata = {
  title: "Frequently asked questions · Visigain",
};

/** The standalone FAQ: the same header, list, scan panel and footer as Home, with its own title. */
export default function FaqPage() {
  return (
    <>
      <FaqTitle />
      <Faq layout="stack" />
      <Cta />
    </>
  );
}
