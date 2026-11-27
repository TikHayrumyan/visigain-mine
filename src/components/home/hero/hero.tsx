import Image from "next/image";
import type { PlaceSearchSettings } from "@/lib/api/places";
import { HeroSurface } from "./hero-surface";
import { ProductPreview } from "./product-preview";
import { ScanForm } from "./scan-form";

/** The home page's hero: the dark dotted panel (under the header) with the pitch, the scan form and the product. */
export function Hero({ search }: { search: PlaceSearchSettings }) {
  return (
    <HeroSurface
      aria-labelledby="hero-title"
      className="relative mx-2 mt-2 overflow-hidden rounded-panel-sm bg-ink lg:m-0 lg:overflow-x-clip lg:overflow-y-visible lg:rounded-none lg:bg-transparent"
      panelClassName="absolute inset-0 overflow-hidden lg:inset-x-4 lg:bottom-auto lg:h-237 lg:rounded-panel lg:bg-ink bg-linear-to-t from-black/70 via-black/20 to-black/0"
    >
      <div
        data-theme="dark"
        className="relative z-10 flex flex-col items-start gap-4 px-4 pt-26.5 text-fg lg:mx-auto lg:max-w-177.5 lg:items-center lg:gap-5 lg:px-0 lg:pt-48 lg:text-center"
      >
        <p className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface py-1.5 pr-3.25 pl-2.5 text-label-m">
          <Image src="/icons/map-pin-area.svg" alt="Map pin area icon" width={16} height={16} />
          For local businesses in Los Angeles
        </p>
        <h1 id="hero-title" className="font-display text-display-s lg:text-display-m">
          Know how visible you are. Then fix it.
        </h1>
        <p className="text-body-l text-muted lg:max-w-155">
          Your Visibility Grade, A to F, across Google, AI assistants and your own website. The three fixes that matter
          most, and how you compare with the businesses Google shows first.
        </p>
        <ScanForm search={search} />
        <p className="text-body-s text-faint lg:whitespace-nowrap">
          Free · No call · No access to your accounts · Results in about 15 minutes
        </p>
      </div>

      <ProductPreview />
    </HeroSurface>
  );
}
