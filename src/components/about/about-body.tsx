import type { AboutContent } from "@/lib/api/about";

/** The rest of the about copy, in the same narrow card the FAQ page uses. */
export function AboutBody({ about }: { about: AboutContent }) {
  return (
    <section className="bg-bg pt-10 lg:pt-hero">
      <div className="mx-auto flex w-full max-w-360 flex-col items-center px-5 lg:px-30">
        <div className="flex w-full max-w-200 flex-col gap-8 rounded-panel-sm bg-surface px-5 py-8 ring-1 ring-line ring-inset lg:px-8 lg:py-10">
          {about.sections.map((section) => (
            <div key={section.label ?? section.paragraphs[0]} className="flex flex-col gap-3">
              {section.label ? <h2 className="font-display text-title-s text-fg">{section.label}</h2> : null}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-body-l text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-1 border-t border-line pt-8">
            <p className="font-display text-title-s text-fg">{about.company.legalName}</p>
            <p className="text-body-m text-muted">{about.company.address}</p>
            <a href={`mailto:${about.company.email}`} className="w-fit text-body-m text-fg no-underline hover:underline">
              {about.company.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
