export type Testimonial = {
  company: string
  letter: string
  quote: string
  name: string
  role: string
  photo: string
  metric: string
  metricLabel: string
  /** The panel beside the quote. */
  tone: "bg-chip-ok" | "bg-grid-wash" | "bg-review-wash"
}

export const TESTIMONIALS: Testimonial[] = [
  {
    company: "Glow Aesthetics",
    letter: "G",
    quote: "Three fixes from the report got us into Google’s top three for ‘med spa’.",
    name: "Laura Bennett",
    role: "Owner at Glow Aesthetics · Santa Monica",
    photo: "/images/testimonials/laura.png",
    metric: "C → A",
    metricLabel: "Visibility Grade in 6 weeks",
    tone: "bg-chip-ok",
  },
  {
    company: "Reyes Injury Law",
    letter: "R",
    quote: "For the first time, AI assistants name our firm when people ask for a lawyer.",
    name: "Michael Reyes",
    role: "Managing Partner at Reyes Injury Law · Los Angeles",
    photo: "/images/testimonials/michael.png",
    metric: "7 of 8",
    metricLabel: "AI answers that now name the firm",
    tone: "bg-grid-wash",
  },
  {
    company: "Pacific Smile Studio",
    letter: "P",
    quote: "One grade my whole team understands. We check it every Monday.",
    name: "Sarah Kim",
    role: "Marketing Manager at Pacific Smile Studio · Pasadena",
    photo: "/images/testimonials/sarah.png",
    metric: "+38%",
    metricLabel: "More calls from Google",
    tone: "bg-review-wash",
  },
]
