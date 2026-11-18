import Image from "next/image";
import { AreaScoresCard } from "./area-scores-card";

/**
 * The dashboard in a browser window. On a phone the window runs off the panel's right edge; on a wide screen the
 * "By area" card floats over its right edge and the bottom fades into the page.
 */
export function ProductPreview() {
  return (
    <div className="relative mt-9 h-75 lg:mt-16 lg:h-180 lg:overflow-hidden lg:px-10">
      <div data-theme="light" className="relative ml-4 w-120 lg:mx-auto lg:w-auto lg:max-w-300">
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-window-sm lg:rounded-card lg:shadow-window">
          <div className="flex h-6 items-center justify-between border-b border-line bg-surface-subtle px-2.5 lg:h-11 lg:px-4">
            <Image src="/images/hero/browser-dots.svg" alt="" width={52} height={12} className="w-6.5 lg:w-13" />
            <span className="flex h-3.5 w-hero items-center justify-center rounded-sm border border-line bg-surface text-mockup-address text-muted lg:h-auto lg:w-auto lg:rounded-lg lg:px-4 lg:py-1.5 lg:text-label-s">
              app.visigain.com
            </span>
            <span className="w-6.5 lg:w-13" />
          </div>
          <Image
            src="/images/hero/dashboard.png"
            alt="The Visigain dashboard: the visibility grade, the key numbers and the fixes to do first"
            width={2880}
            height={1800}
            sizes="(width >= 64rem) 1200px, 200px"
            preload
            className="h-75 w-full object-cover object-top-left lg:h-auto"
          />
        </div>
        <AreaScoresCard className="absolute top-76.5 -right-17.5 hidden lg:flex" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-50 bg-linear-to-b from-bg/0 to-bg lg:block" />
    </div>
  );
}
