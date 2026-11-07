import Link from "next/link";
import { getT } from "@/wordings/server";

/** The home page's place: no design yet. It shows one wording and links to the wiring proof (/example). */
export default async function HomePage() {
  const t = await getT();
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-site px-4 pb-section">
      <h1 className="text-display">
        <Link href="/example">{t("site.home.get_your_free_grade")}</Link>
      </h1>
    </main>
  );
}
