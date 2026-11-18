import { SiteHeader } from "@/components/site/site-header";
import { loadSite } from "@/site/server";
import { getT } from "@/wordings/server";

/**
 * The home page: the header on the hero's dark panel (dark in both themes). The hero and the sections below it are
 * still to be built.
 */
export default async function HomePage() {
  const [t, site] = await Promise.all([getT(), loadSite()]);
  return (
    <div data-theme="dark" className="mx-2 mt-2 rounded-panel-sm bg-ink text-fg lg:mx-4 lg:mt-0 lg:rounded-panel">
      <SiteHeader t={t} holding={site.holding} />
      <main id="main" tabIndex={-1} />
    </div>
  );
}
