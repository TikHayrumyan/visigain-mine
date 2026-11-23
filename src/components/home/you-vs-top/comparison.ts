/** Example comparison, until a real scan supplies the business and the three it is measured against. */
export const COMPARISON = {
  title: "You vs the top 3 near you",
  caption: "Searches for “med spa” around Torrance",
  rows: [
    { name: "Veda Med Spa", rank: "1.4", reviews: "412", rating: "4.9", answer: "Named 7 of 8", named: true },
    {
      name: "Hydration Room · Torrance",
      rank: "2.8",
      reviews: "135",
      rating: "4.8",
      answer: "Named 5 of 8",
      named: true,
    },
    { name: "Soft Glow Med Spa", rank: "3.6", reviews: "120", rating: "4.7", answer: "Named 3 of 8", named: true },
    { name: "Your business", rank: "9.2", reviews: "38", rating: "4.6", answer: "Not named", named: false },
  ],
} as const;
