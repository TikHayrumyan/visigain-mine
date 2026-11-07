import Link from "next/link";
import type { T } from "@/wordings/t";

/**
 * What a closed page shows while GET /site says `holding`: the site's own "page not found" words, with the contact
 * link as the only action (the backend's holding rule: a closed page answers as not found, and its one link is
 * "Contact us").
 */
export function HoldingPage({ t }: { t: T }) {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-prose px-4 py-section">
      <h1 className="text-title">{t("errors.not_found.we_can_t_find_that_page")}</h1>
      <p className="mt-stack">
        <Link href="/contact">{t("errors.not_found.contact_us")}</Link>
      </p>
    </main>
  );
}
