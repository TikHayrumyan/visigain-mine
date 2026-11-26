"use client";

import { useEffect, useState } from "react";

const ZONE = "America/Los_Angeles";

function format(date: Date): string {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `It’s ${time} in Los Angeles`;
}

/** Los Angeles local time, refreshed on the minute. The clock text may differ between server and client. */
export function LosAngelesTime() {
  const [label, setLabel] = useState(() => format(new Date()));

  useEffect(() => {
    const update = () => setLabel(format(new Date()));
    update();
    const delay = 60_000 - (Date.now() % 60_000);
    let interval = 0;
    const timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 60_000);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <span className="whitespace-nowrap" suppressHydrationWarning>
      {label}
    </span>
  );
}
