export type Business = {
  name: string;
  address: string;
};

/** Local names the scan field can offer. The first three are the design's "Skin Wo" results, in that order. */
const BUSINESSES: readonly Business[] = [
  { name: "Skin Works Medical Spa", address: "2400 Pacific Coast Hwy, Torrance, CA" },
  { name: "Skin Worx Aesthetics", address: "8580 Sunset Blvd, West Hollywood, CA" },
  { name: "SkinWorks Med Spa — Pasadena", address: "45 E Colorado Blvd, Pasadena, CA" },
  { name: "Glow Theory Studio", address: "1120 Abbot Kinney Blvd, Venice, CA" },
  { name: "Harbor Dental Group", address: "301 E Ocean Blvd, Long Beach, CA" },
  { name: "Atelier Nails", address: "8600 Melrose Ave, West Hollywood, CA" },
];

function fold(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Up to three businesses whose name contains the typed text, ignoring spaces and punctuation. */
export function suggestBusinesses(query: string): Business[] {
  const needle = fold(query);
  if (!needle) return [];
  return BUSINESSES.filter((business) => fold(business.name).includes(needle)).slice(0, 3);
}
