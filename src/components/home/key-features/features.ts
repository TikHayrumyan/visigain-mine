export type Feature = {
  title: string
  body: string
  icon: "grid" | "pin" | "chat" | "search" | "check" | "mail"
  /** Visual sits on the left on a wide screen. */
  visualFirst?: boolean
  link?: { label: string; href: string }
}

export const FEATURES: Feature[] = [
  {
    title: "Your Visibility Grade, A to F",
    body: "One letter and one score, measured the same way for every business.",
    icon: "grid",
  },
  {
    title: "Your map rank, block by block",
    body: "Where you show up on Google Maps at the locations around your business.",
    icon: "pin",
    visualFirst: true,
  },
  {
    title: "Reviews and replies",
    body: "Your rating, new reviews and how many you’ve answered.",
    icon: "chat",
  },
  {
    title: "Citations across 36 directories",
    body: "Where you’re listed, where you’re missing, and where your details don’t match.",
    icon: "search",
    visualFirst: true,
  },
  {
    title: "The fixes, in order",
    body: "Every finding comes with its evidence and the exact fix, ranked by what to do first.",
    icon: "check",
    link: { label: "See what a full report includes", href: "/sample-report" },
  },
  {
    title: "Weekly checks, instant alerts",
    body: "A full re-check every week, a quick check every day, and an alert at once if your site or booking link breaks.",
    icon: "mail",
    visualFirst: true,
  },
]
