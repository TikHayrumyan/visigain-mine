import styles from "./hero.module.css";

interface AreaScore {
  name: string;
  /** Out of 100; none when the area was not assessed. */
  score?: number;
  bar?: string;
}

const AREAS: AreaScore[] = [
  { name: "Findability", score: 61.2, bar: "bg-grade-c" },
  { name: "Reputation", score: 54, bar: "bg-grade-c" },
  { name: "Website experience", score: 70.1, bar: "bg-green" },
  { name: "AI answers", score: 38.5, bar: "bg-grade-d" },
  { name: "Trust" },
];

/** The sample "By area" card that floats over the dashboard's right edge (wide screens only). */
export function AreaScoresCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex w-100 flex-col rounded-card-lg border border-line bg-surface p-7 text-fg shadow-card ${className}`}
    >
      <div className="flex flex-col gap-1">
        <p className="font-display text-headline-s">By area</p>
        <p className="text-body-m text-muted">Your score in each area, out of 100</p>
      </div>
      <ul className="flex flex-col gap-5 pt-6">
        {AREAS.map(({ name, score, bar }) => (
          <li key={name} className="flex flex-col gap-2">
            <div className="flex justify-between gap-2 text-label-m">
              <span>{name}</span>
              {score === undefined ? (
                <span className="font-normal text-muted">Not assessed</span>
              ) : (
                <span>{score}</span>
              )}
            </div>
            <div className={`h-3 overflow-hidden rounded-pill ${styles.track}`}>
              {score !== undefined && <div className={`h-full rounded-pill ${bar}`} style={{ width: `${score}%` }} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
