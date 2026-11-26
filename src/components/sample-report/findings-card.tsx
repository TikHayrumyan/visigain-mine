import Image from "next/image";
import { FINDINGS, type Evidence } from "./content";

function EvidenceList({ rows }: { rows: readonly Evidence[] }) {
  return (
    <ul className="flex flex-col gap-1 pt-1">
      {rows.map((row) => (
        <li key={row.source} className="flex items-center gap-2">
          <span className="min-w-0 flex-1 text-body-m text-muted">{row.source}</span>
          {row.differs ? (
            <span className="inline-flex h-6.5 shrink-0 items-center rounded-full bg-chip-warn px-2.5 text-label-s text-chip-warn-text">
              Differs
            </span>
          ) : null}
          <span className="shrink-0 text-label-m text-fg">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Each finding: the problem and its evidence, then the fix. */
export function FindingsCard() {
  return (
    <article className="rounded-card-lg bg-surface p-5 lg:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-headline-s text-fg">Top findings</h2>
        <p className="text-body-m text-muted">What we found, and the fix for each.</p>
      </div>
      <ul className="flex flex-col gap-4 pt-5">
        {FINDINGS.map((finding) => (
          <li key={finding.problem} className="flex flex-col items-center gap-3 lg:flex-row lg:items-stretch">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-2 rounded-[20px] border border-line bg-surface p-4 lg:p-5">
              <p className="text-label-s text-muted">Problem</p>
              <p className="text-label-l text-fg">{finding.problem}</p>
              <p className="text-body-m text-fg">{finding.detail}</p>
              {finding.evidence ? <EvidenceList rows={finding.evidence} /> : null}
            </div>
            <span className="grid size-8 shrink-0 rotate-90 place-items-center self-center rounded-2xl bg-surface-subtle lg:rotate-0">
              <Image src="/icons/arrow-right-ink.svg" alt="" width={16} height={16} />
            </span>
            <div className="flex w-full min-w-0 flex-1 flex-col gap-2 rounded-[20px] bg-chip-ok p-4 lg:p-5">
              <p className="text-label-s text-ok">Fix</p>
              <p className="text-label-l text-fg">{finding.fix}</p>
              <p className="text-body-m text-muted">{finding.why}</p>
              <span className="mt-1 inline-flex h-6.5 w-fit items-center rounded-full bg-surface px-2.5 text-label-s text-muted">
                {finding.where}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
