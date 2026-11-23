import Image from "next/image";
import Link from "next/link";
import { FEATURES, type Feature } from "./features";

/** Six feature rows, shown in full. The scroll stack comes later, from the card-stack animation. */
export function KeyFeatures() {
  return (
    <section className="bg-bg pt-16 lg:pt-35">
      <div className="mx-auto flex max-w-160 flex-col items-center gap-4 px-5 text-center lg:px-0">
        <h2 className="font-display text-headline-m text-fg lg:text-headline-l">
          Everything that decides whether you get the call
        </h2>
        <p className="max-w-140 text-body-l text-muted">
          One grade, the fixes behind it, and weekly checks to keep it moving. We apply the same standard to every
          business, and each finding comes with its evidence.
        </p>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-270 flex-col gap-10 px-4 lg:px-0">
        {FEATURES.map((feature) => (
          <FeatureRow key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  if (feature.icon === "grid") return <GradeCard />;
  if (feature.icon === "pin") return <MapCard />;
  if (feature.icon === "chat") return <ReviewsCard />;
  if (feature.icon === "search") return <CitationsCard />;
  if (feature.icon === "check") return <FixesCard />;

  return (
    <article className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-card lg:h-133 lg:flex-row">
      <div
        className={`flex flex-col justify-between gap-8 p-6 lg:h-full lg:w-95 lg:p-8 lg:pb-12 ${feature.visualFirst ? "lg:order-2" : ""}`}
      >
        <Icon />
        <div className="flex flex-col gap-5">
          <h3 className="font-display text-title-l text-fg lg:text-display-s">{feature.title}</h3>
          <p className="text-body-l text-muted">{feature.body}</p>
          {feature.link && (
            <Link href={feature.link.href} className="inline-flex items-center gap-1.5 text-label-m text-fg no-underline">
              {feature.link.label}
              <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
            </Link>
          )}
        </div>
      </div>
      <div className={`min-h-64 flex-1 p-4 lg:min-h-0 lg:p-4 ${feature.visualFirst ? "lg:order-1" : ""}`}>
        <AlertsVisual />
      </div>
    </article>
  );
}


const NEARBY = [
  { grade: "A", name: "Veda Med Spa", score: "88.4", bar: "90.14%", tone: "bg-green", yours: false },
  { grade: "B", name: "Hydration Room", score: "81.2", bar: "82.75%", tone: "bg-grade-b", yours: false },
  { grade: "B", name: "You", score: "75.9", bar: "77.46%", tone: "bg-grade-b", yours: true },
  { grade: "C", name: "Soft Glow Med Spa", score: "64.7", bar: "66.2%", tone: "bg-grade-c", yours: false },
] as const;

function GradeCard() {
  return (
    <article className="flex flex-col items-center overflow-hidden rounded-[28px] bg-surface p-2 shadow-lift outline outline-1 -outline-offset-1 outline-line lg:h-133 lg:flex-row lg:gap-12 lg:rounded-[40px] lg:p-4">
      <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:h-full lg:w-95 lg:justify-between lg:gap-0 lg:pt-8 lg:pr-0 lg:pb-12 lg:pl-8">
        <span className="grid size-14 place-items-center rounded-full bg-ink">
          <Image src="/icons/layout-grid.svg" alt="" width={24} height={24} />
        </span>
        <div className="flex w-full flex-col gap-5">
          <h3 className="font-display text-headline-s text-fg lg:text-display-s">Your Visibility Grade, A to F</h3>
          <p className="text-body-l text-muted">One letter and one score, measured the same way for every business.</p>
        </div>
      </div>
      <div className="@container w-full lg:w-155 lg:shrink-0">
        <div className="relative h-[calc(500px*100cqw/620px)] w-full overflow-hidden rounded-[13.239px] bg-chip-ok outline outline-[1.103px] -outline-offset-1 outline-chip-ok lg:h-125 lg:rounded-panel-sm lg:outline-2">
          <div className="absolute top-0 left-0 h-125 w-155 origin-top-left scale-[calc(100cqw/620px)] lg:scale-100">
            <GradeScene />
          </div>
        </div>
      </div>
    </article>
  );
}

function GradeScene() {
  return (
    <div className="relative h-125 w-155">
      <div className="absolute top-8.25 left-10 flex w-80 flex-col gap-4 rounded-[20px] border border-line bg-surface p-6">
        <p className="text-label-m text-muted">Visibility Grade</p>
        <div className="flex items-center gap-3.5">
          <span className="grid size-14 place-items-center rounded-[14px] bg-grade-b font-display text-[32px] leading-9 text-ink">
            B
          </span>
          <span className="font-display text-display-s text-fg">75.9</span>
          <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-chip-ok pr-2.5 pl-2 text-label-s text-ok">
            <Image src="/icons/spark.svg" alt="" width={14} height={14} />
            1.2
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <span className="h-2 w-12.75 rounded-sm bg-danger opacity-35" />
            <span className="h-2 w-12.75 rounded-sm bg-grade-d opacity-35" />
            <span className="h-2 w-12.75 rounded-sm bg-grade-c opacity-35" />
            <span className="h-2 w-12.75 rounded-sm bg-grade-b" />
            <span className="h-2 w-12.5 rounded-sm bg-green opacity-35" />
          </div>
          <div className="flex gap-1 text-center text-label-s">
            {["F", "D", "C", "B", "A"].map((letter) => (
              <span key={letter} className={`${letter === "A" ? "w-12.5" : "w-12.75"} ${letter === "B" ? "text-fg" : "text-faint"}`}>
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute top-50.5 left-53.5 flex w-95 flex-col gap-4 rounded-[20px] border border-line bg-surface px-6 py-5 shadow-card">
        <div className="flex flex-col gap-0.5">
          <p className="font-display text-title-s text-fg">How you compare nearby</p>
          <p className="text-body-s text-faint">Top Google results for “med spa”</p>
        </div>
        <ul className="flex flex-col gap-5">
          {NEARBY.map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg text-label-m text-ink ${item.tone}`}>
                {item.grade}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex justify-between text-body-m">
                  <span className={item.yours ? "font-medium" : "font-normal"}>{item.name}</span>
                  <span className="font-medium">{item.score}</span>
                </span>
                <span className="h-2.5 overflow-hidden rounded-pill bg-surface-subtle bg-[url('/images/features/track.png')] bg-size-[7px_7px]">
                  <span
                    className={`block h-full rounded-pill ${item.yours ? "bg-green" : "bg-line-darken"}`}
                    style={{ width: item.bar }}
                  />
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const KEYWORDS = ["med spa", "botox", "lip filler", "laser hair removal", "HydraFacial"] as const;

const LEGEND: { name: string; note?: string; count: string; bar: string; tone: string }[] = [
  { name: "High", note: "rank 1–3", count: "24", bar: "w-[88px]", tone: "bg-green" },
  { name: "Mid", note: "rank 4–10", count: "6", bar: "w-[22px]", tone: "bg-grade-c" },
  { name: "Low", note: "rank 11–20", count: "2", bar: "w-[7px]", tone: "bg-grade-d" },
  { name: "Not in top 20", count: "17", bar: "w-[62px]", tone: "bg-line-darken" },
];

const RANKS = [
  ["–", "–", "–", "–", "–", "–", "–"],
  ["9", "8", "5", "3", "4", "3", "14"],
  ["5", "4", "2", "1", "2", "1", "17"],
  ["1", "1", "2", "1", "2", "2", "–"],
  ["1", "1", "1", "1", "2", "1", "–"],
  ["1", "1", "1", "1", "1", "1", "–"],
  ["–", "–", "–", "–", "–", "–", "–"],
] as const;

function rankTone(label: string) {
  if (label === "–") return "border border-dashed border-line-darken bg-surface text-muted";
  const rank = Number(label);
  if (rank <= 3) return "bg-green text-ink";
  if (rank <= 10) return "bg-grade-c text-ink";
  return "bg-grade-d text-ink";
}

function MapCard() {
  return (
    <article className="flex flex-col items-center overflow-hidden rounded-[28px] bg-surface p-2 shadow-lift outline outline-1 -outline-offset-1 outline-line lg:h-133 lg:flex-row-reverse lg:gap-12 lg:rounded-[40px] lg:p-4">
      <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:h-full lg:w-95 lg:justify-between lg:gap-0 lg:pt-8 lg:pr-8 lg:pb-12 lg:pl-0">
        <span className="grid size-14 place-items-center rounded-full bg-ink">
          <Image src="/icons/map-pin-area-24.svg" alt="" width={24} height={24} />
        </span>
        <div className="flex w-full flex-col gap-5">
          <h3 className="font-display text-headline-s text-fg lg:text-display-s">Your map rank, block by block</h3>
          <p className="text-body-l text-muted">Where you show up on Google Maps at the locations around your business.</p>
        </div>
      </div>
      <div className="@container w-full lg:w-155 lg:shrink-0">
        <div className="relative h-[calc(500px*100cqw/620px)] w-full overflow-hidden rounded-[13.239px] bg-grid-wash outline outline-[1.103px] -outline-offset-1 outline-grid-wash lg:h-125 lg:rounded-panel-sm lg:outline-2">
          <div className="absolute top-0 left-0 h-125 w-155 origin-top-left scale-[calc(100cqw/620px)] lg:scale-100">
            <MapScene />
          </div>
        </div>
      </div>
    </article>
  );
}

function MapScene() {
  return (
    <div className="relative h-125 w-155">
      <div className="absolute top-12 left-8 flex h-124 w-136 flex-col rounded-[28px] bg-surface p-7">
        <div className="flex h-16 items-center justify-between pb-5">
          <p className="font-display text-headline-s text-fg">Local Search Grid</p>
          <span className="inline-flex h-11 items-center px-1 text-label-m text-fg">Open the grid</span>
        </div>
        <div className="flex h-11 items-center">
          <div className="flex gap-0.5 rounded-pill bg-surface-subtle p-1">
            {KEYWORDS.map((word, index) => (
              <span
                key={word}
                className={`inline-flex h-9 items-center rounded-pill px-3.5 text-label-s ${index === 0 ? "bg-surface text-fg shadow-[0_0_0_1px_var(--color-line)]" : "text-muted"}`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-7 pt-5">
          <div className="flex w-37 shrink-0 flex-col gap-5">
            <div>
              <p className="whitespace-nowrap text-body-s text-muted">Average rank for “med spa”</p>
              <div className="flex h-10 items-center gap-2.5 pt-1">
                <p className="font-display text-display-s text-fg">3.1</p>
                <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-chip-ok pr-2.5 pl-2 text-label-s text-ok">
                  <Image src="/icons/spark.svg" alt="" width={14} height={14} />
                  0.4
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-5">
              {LEGEND.map((item) => (
                <li key={item.name} className="flex flex-col gap-2">
                  <div className="flex h-[13px] items-center justify-between">
                    <p className="whitespace-nowrap">
                      <span className="text-label-m text-fg">{item.name}</span>
                      {item.note && <span className="text-label-s text-muted"> {item.note}</span>}
                    </p>
                    <span className="text-label-m text-fg">{item.count}</span>
                  </div>
                  <div className="h-3.25 overflow-hidden rounded-pill bg-surface-subtle bg-[url('/images/features/track.png')] bg-size-[7px_7px]">
                    <div className={`h-full rounded-pill ${item.tone} ${item.bar}`} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative size-78 shrink-0 overflow-hidden rounded-[22px] bg-map">
            <Image src="/images/features/map-streets.svg" alt="" width={312} height={312} className="absolute top-0 left-0.5 max-w-none" />
            <Image
              src="/images/features/map.png"
              alt=""
              width={425}
              height={359}
              className="absolute top-[-18px] left-[-89px] h-[359px] w-[425px] max-w-none object-cover"
            />
            <div className="absolute top-[17px] left-[17px] flex flex-col gap-[7px]">
              {RANKS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-[7px]">
                  {row.map((label, column) => (
                    <span
                      key={`${label}-${column}`}
                      className={`grid size-8.5 place-items-center rounded-full text-label-s ${rankTone(label)} ${rowIndex === 3 && column === 3 ? "shadow-[0_0_0_3px_var(--color-surface),0_0_0_5px_var(--color-ink)]" : ""}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SOURCES = [
  { name: "Google", detail: "4.8 from 340 reviews" },
  { name: "Yelp", detail: "4.6 from 53 reviews" },
] as const;

const REVIEWS = [
  { stars: "★★★★★", when: "Oct 3 · Google", text: "Dr. Lee and the whole team made me feel so comfortable." },
  { stars: "★★★★★", when: "Sep 26 · Yelp", text: "Before and after my second session. So happy with how natural it looks." },
  { stars: "★★★★", when: "Sep 21 · Google", text: "Rating only, no written review." },
] as const;

function ReviewsCard() {
  return (
    <article className="flex flex-col items-center overflow-hidden rounded-[28px] bg-surface p-2 shadow-lift outline outline-1 -outline-offset-1 outline-line lg:h-133 lg:flex-row lg:gap-12 lg:rounded-[40px] lg:p-4">
      <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:h-full lg:w-95 lg:justify-between lg:gap-0 lg:pt-8 lg:pr-0 lg:pb-12 lg:pl-8">
        <span className="grid size-14 place-items-center rounded-full bg-ink">
          <Image src="/icons/message-square-more.svg" alt="" width={24} height={24} />
        </span>
        <div className="flex w-full flex-col gap-5">
          <h3 className="font-display text-headline-s text-fg lg:text-display-s">Reviews and replies</h3>
          <p className="text-body-l text-muted">Your rating, new reviews and how many you’ve answered.</p>
        </div>
      </div>
      <div className="@container w-full lg:w-155 lg:shrink-0">
        <div className="relative h-[calc(500px*100cqw/620px)] w-full overflow-hidden rounded-[13.239px] bg-review-wash lg:h-125 lg:rounded-panel-sm">
          <div className="absolute top-0 left-0 h-125 w-155 origin-top-left scale-[calc(100cqw/620px)] lg:scale-100">
            <ReviewsScene />
          </div>
        </div>
      </div>
    </article>
  );
}

function ReviewsScene() {
  return (
    <div className="relative h-125 w-155">
      <div className="absolute top-8 left-8 flex w-80 flex-col gap-4 rounded-[20px] border border-line bg-surface px-6 pt-6 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[32px] leading-9 tracking-[-0.03em] text-grade-c">★</span>
          <span className="font-display text-display-s text-fg">4.8</span>
          <span className="text-body-s text-faint">Google rating</span>
        </div>
        <p className="text-label-m text-muted">Where we read reviews</p>
        <div>
          {SOURCES.map((source) => (
            <div key={source.name} className="flex items-center justify-between border-t border-line py-2.5">
              <span className="text-label-m text-fg">{source.name}</span>
              <span className="text-body-s text-fg">{source.detail}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-48 left-61.5 flex w-85 flex-col gap-3 rounded-[20px] border border-line bg-surface p-5 shadow-card">
        <p className="font-display text-title-s text-fg">Newest Google and Yelp reviews</p>
        {REVIEWS.map((review) => (
          <div key={review.when} className="flex flex-col gap-1 border-t border-line pt-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="text-label-s text-grade-c">{review.stars}</span>
                <span className="text-body-s text-faint">{review.when}</span>
              </span>
              <span className="inline-flex h-6.5 items-center rounded-pill bg-chip-warn px-2.5 text-label-s text-chip-warn-text">
                No reply yet
              </span>
            </div>
            <p className="truncate text-body-s text-fg">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const DIRECTORIES = [
  { name: "Google", fields: [true, true, true] },
  { name: "Yelp", fields: [true, true, false] },
  { name: "Apple Maps", fields: [true, false, true] },
  { name: "Facebook", fields: [true, true, true] },
] as const;

function CitationsCard() {
  return (
    <article className="flex flex-col items-center overflow-hidden rounded-[28px] bg-surface p-2 shadow-lift outline outline-1 -outline-offset-1 outline-line lg:h-133 lg:flex-row-reverse lg:gap-12 lg:rounded-[40px] lg:p-4">
      <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:h-full lg:w-95 lg:justify-between lg:gap-0 lg:pt-8 lg:pr-8 lg:pb-12 lg:pl-0">
        <span className="grid size-14 place-items-center rounded-full bg-ink">
          <Image src="/icons/search-24.svg" alt="" width={24} height={24} />
        </span>
        <div className="flex w-full flex-col gap-5">
          <h3 className="font-display text-headline-s text-fg lg:text-display-s">Citations across 36 directories</h3>
          <p className="text-body-l text-muted">
            Where you’re listed, where you’re missing, and where your details don’t match.
          </p>
        </div>
      </div>
      <div className="@container w-full lg:w-155 lg:shrink-0">
        <div className="relative h-[calc(500px*100cqw/620px)] w-full overflow-hidden rounded-[13.239px] bg-chip-ok lg:h-125 lg:rounded-panel-sm">
          <div className="absolute top-0 left-0 h-125 w-155 origin-top-left scale-[calc(100cqw/620px)] lg:scale-100">
            <CitationsScene />
          </div>
        </div>
      </div>
    </article>
  );
}

function CitationsScene() {
  return (
    <div className="relative h-125 w-155">
      <div className="absolute top-8 left-8 flex w-90 flex-col gap-3.5 rounded-[20px] border border-line bg-surface p-6">
        <p className="font-display text-title-s text-fg">Directories where we found you</p>
        <p className="flex items-baseline gap-2">
          <span className="font-display text-display-s text-fg">17</span>
          <span className="text-body-m text-faint">of 36</span>
        </p>
        <div className="h-3 w-full overflow-hidden rounded-pill bg-surface-subtle bg-[url('/images/features/track.png')] bg-size-[10.5px_10.5px]">
          <div className="h-full w-35 rounded-pill bg-ink" />
        </div>
        <div className="flex w-full flex-col gap-0.5 overflow-hidden rounded-md bg-chip-warn px-3 py-2.5 whitespace-nowrap">
          <p className="text-label-m text-fg">2 listings with wrong details</p>
          <p className="text-body-s text-muted">Name, address or phone doesn’t match Google.</p>
        </div>
      </div>
      <div className="absolute top-49 left-51.5 flex w-95 flex-col gap-3 rounded-[20px] border border-line bg-surface p-5 shadow-card">
        <p className="font-display text-title-s text-fg">Name, address and phone</p>
        <div>
          <div className="flex items-center justify-between pb-2 text-label-s text-faint">
            <span className="flex-1">Source</span>
            <span className="w-16 text-center">Name</span>
            <span className="w-16 text-center">Address</span>
            <span className="w-16 text-center">Phone</span>
          </div>
          {DIRECTORIES.map((row) => (
            <div key={row.name} className="flex items-center justify-between border-t border-line py-2.5">
              <span className="flex-1 text-label-m text-fg">{row.name}</span>
              {row.fields.map((ok, index) => (
                <span key={index} className="grid h-6 w-16 place-items-center">
                  <span className={`grid size-7 place-items-center rounded-full ${ok ? "bg-chip-ok" : "bg-danger-soft"}`}>
                    <Image src={ok ? "/icons/check.svg" : "/icons/x.svg"} alt="" width={ok ? 16 : 14} height={ok ? 16 : 14} />
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FIXES: { text: string; effort: string; help: boolean; tall?: boolean }[] = [
  {
    text: "Link every active profile from the website footer, ensure each profile links back, and declare them in sameAs schema.",
    effort: "Low",
    help: false,
  },
  {
    text: "State qualifications, licence numbers and issuing bodies on practitioner biographies. Specificity is what makes a credential a credential.",
    effort: "Low",
    help: false,
  },
  {
    text: "Install the relevant pixels and build audiences from service page visitors. Retargeting is the cheapest paid traffic available and most practices leave it unused. For a med spa, keep advertising pixels off booking, intake and patient-portal pages, where they can send a patient’s appointment or health details to the ad platform.",
    effort: "Medium",
    help: true,
    tall: true,
  },
  {
    text: "Build a consented before-and-after library covering each core treatment. Consistent lighting and angles matter more than volume.",
    effort: "Medium",
    help: false,
  },
  {
    text: "Attribute every testimonial with at least a first name and, where possible, the source platform so it can be verified.",
    effort: "Low",
    help: false,
  },
];

function FixesCard() {
  return (
    <article className="flex flex-col items-center overflow-hidden rounded-[28px] bg-surface p-2 shadow-lift outline outline-1 -outline-offset-1 outline-line lg:h-133 lg:flex-row lg:gap-12 lg:rounded-[40px] lg:p-4">
      <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:h-full lg:w-95 lg:justify-between lg:gap-0 lg:pt-8 lg:pr-0 lg:pb-12 lg:pl-8">
        <span className="grid size-14 place-items-center rounded-full bg-ink">
          <Image src="/icons/check-24.svg" alt="" width={24} height={24} />
        </span>
        <div className="flex w-full flex-col gap-5">
          <h3 className="font-display text-headline-s text-fg lg:text-display-s">The fixes, in order</h3>
          <p className="text-body-l text-muted">
            Every finding comes with its evidence and the exact fix, ranked by what to do first.
          </p>
          <Link href="/sample-report" className="inline-flex items-center gap-1.5 pt-2 text-label-l text-fg no-underline">
            See what a full report includes
            <Image src="/icons/arrow-right-ink.svg" alt="" width={20} height={20} />
          </Link>
        </div>
      </div>
      <div className="@container w-full lg:w-155 lg:shrink-0">
        <div className="relative h-[calc(500px*100cqw/620px)] w-full overflow-hidden rounded-[13.239px] bg-grid-wash outline outline-[1.103px] -outline-offset-1 outline-grid-wash lg:h-125 lg:rounded-panel-sm lg:outline-2">
          <div className="absolute top-0 left-0 h-125 w-155 origin-top-left scale-[calc(100cqw/620px)] lg:scale-100">
            <FixesScene />
          </div>
        </div>
      </div>
    </article>
  );
}

function FixesScene() {
  return (
    <div className="relative h-125 w-155">
      <div className="absolute top-11.5 left-7.5 w-277 rounded-[28px] bg-surface p-7">
        <div className="flex flex-col gap-1">
          <p className="font-display text-headline-s text-fg">What to fix first</p>
          <p className="text-body-m text-muted">35 fixes in order: the ones that move your grade the most come first.</p>
        </div>
        <div className="grid grid-cols-[56px_minmax(0,1fr)_110px_180px] pt-5">
          {["#", "Fix", "Effort", "Do it yourself?"].map((label) => (
            <span
              key={label}
              className={`border-b border-line px-2 pt-1 pb-[18px] text-label-m text-fg ${label === "Do it yourself?" ? "text-center" : ""}`}
            >
              {label}
            </span>
          ))}
          {FIXES.map((fix, index) => (
            <div key={fix.text} className="contents">
              <span className={`flex items-center border-b border-line px-2 text-label-m text-fg ${fix.tall ? "h-[100px]" : "h-[60px]"}`}>
                {index + 1}
              </span>
              <span className={`flex items-center border-b border-line px-2 text-label-m text-fg ${fix.tall ? "h-[100px]" : "h-[60px]"}`}>
                {fix.text}
              </span>
              <span className={`flex items-center border-b border-line px-2 text-body-m text-fg ${fix.tall ? "h-[100px]" : "h-[60px]"}`}>
                {fix.effort}
              </span>
              <span className={`flex items-center justify-center border-b border-line px-2 ${fix.tall ? "h-[100px]" : "h-[60px]"}`}>
                <span
                  className={`inline-flex h-6.5 items-center rounded-pill px-2.5 text-label-s ${fix.help ? "bg-chip-neutral text-muted" : "bg-chip-ok text-ok"}`}
                >
                  {fix.help ? "Usually needs help" : "Yes"}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsVisual() {
  const bars = ["h-8", "h-10", "h-12", "h-14", "h-16", "h-20", "h-24"];
  return (
    <div className="relative h-full min-h-72 rounded-card bg-warn-soft">
      <div className="absolute top-6 left-6 right-16 rounded-card border border-line bg-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-title-s">Your grade, week by week</p>
            <p className="text-body-s text-muted">Checked every Tuesday</p>
          </div>
          <span className="rounded-pill bg-chip-ok px-2 py-1 text-label-s text-ok">↑ 1.2</span>
        </div>
        <div className="mt-4 flex h-24 items-end gap-2">
          {bars.map((height) => (
            <div key={height} className={`flex-1 rounded-sm bg-line ${height}`} />
          ))}
          <div className="h-full w-6 rounded-sm bg-green" />
        </div>
        <div className="mt-2 flex justify-between text-body-s text-muted">
          <span>Aug 18</span>
          <span>Oct 6</span>
        </div>
      </div>
      <div className="absolute right-6 bottom-16 w-72 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
        <p className="text-label-m">Booking link is down</p>
        <p className="text-body-s text-muted">Daily check · 8:02 AM</p>
      </div>
      <div className="absolute bottom-4 left-10 w-72 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
        <p className="text-label-m">Your grade went up to B</p>
        <p className="text-body-s text-muted">Weekly check · Tuesday</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <span className="grid size-14 place-items-center rounded-full bg-ink text-white">
      <MailIcon />
    </span>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
