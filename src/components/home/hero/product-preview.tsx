import Image from "next/image";
import { AreaScoresCard } from "./area-scores-card";

/**
 * The dashboard in a browser window. On a phone the window runs off the panel's right edge; on a wide screen the
 * "By area" card floats over its right edge and the bottom fades into the page.
 */
export function ProductPreview() {
  return (
    <div className="@container mt-9 w-full lg:mt-16">
      <div className="relative h-[calc(300px*100cqw/390px)] lg:h-[calc(720px*min(1,100cqw/1440px))]">
        <div className="absolute top-0 left-0 h-75 w-97.5 origin-top-left overflow-hidden scale-[calc(100cqw/390px)] lg:left-1/2 lg:h-180 lg:w-360 lg:-ml-180 lg:origin-top lg:scale-[min(1,100cqw/1440px)]">
          <div data-theme="light" className="relative ml-4 w-120 lg:absolute lg:top-0 lg:left-30 lg:ml-0 lg:w-300">
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
                width={3000}
                height={2000}
                sizes="(width >= 64rem) 1200px, 200px"
                preload
                className="h-75 w-full object-cover object-top-left lg:h-auto"
              />
            </div>
            <AreaScoresCard className="absolute top-76.5 -right-17.5 hidden lg:flex" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-50 bg-linear-to-b from-bg/0 to-bg lg:block" />
        </div>
      </div>
    </div>
  );
}
