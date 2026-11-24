/** The three marquee rows. The middle one runs the other way. */
export const CATEGORY_ROWS = [
  [
    "Plumbers",
    "Med spas",
    "Yoga & pilates studios",
    "Roofers",
    "Personal injury law",
    "Cafes",
    "HVAC",
    "Dance studios",
    "Accountants",
    "Auto repair",
    "Hair salons",
    "Veterinarians",
    "Electricians",
    "Restaurants",
    "Martial arts",
    "Family lawyers",
    "Landscapers",
    "Bakeries",
    "Chiropractors",
    "Movers",
    "Insurance agents",
    "Barbers",
    "Pest control",
    "Tattoo shops",
    "Florists",
    "Daycares & preschools",
  ],
  [
    "Real estate agents",
    "Gyms",
    "Dog trainers",
    "Wedding venues",
    "Locksmiths",
    "Nail salons",
    "Photographers",
    "Solar installers",
    "Dermatologists",
    "Bars & pubs",
    "Tutoring",
    "Pool services",
    "Immigration lawyers",
    "Tires & auto glass",
    "Escape rooms",
    "Jewelers",
    "Physical therapy",
    "Painters",
    "Music lessons",
    "Mortgage brokers",
    "Pet groomers",
    "General contractors",
    "Optometrists",
    "Caterers",
    "Language schools",
    "Window treatments",
  ],
  [
    "Auto detailing",
    "Cleaning services",
    "Acupuncture",
    "Print shops",
    "Event planners",
    "Climbing gyms",
    "Estate planning lawyers",
    "Dry cleaners & tailors",
    "Appliance repair",
    "Juice & bubble tea",
    "Interior designers",
    "Waxing & lash studios",
    "IT support",
    "Breweries & wineries",
    "Flooring",
    "Funeral homes",
    "Art classes",
    "Plastic surgeons",
    "Garage doors",
    "Financial advisors",
    "Motorcycle repair",
    "Laundromats",
    "Golf instruction",
    "Makeup artists",
    "Junk removal",
    "Private schools",
  ],
] as const;

export const BUSINESS_GROUPS = [
  {
    name: "Home services",
    count: "43 types",
    examples: "Plumbers · HVAC · Roofers",
    image: "/images/who/home-services.png",
    width: 896,
    height: 1200,
  },
  {
    name: "Health & beauty",
    count: "31 types",
    examples: "Med spas · Salons · Chiropractors",
    image: "/images/who/health-beauty.png",
    width: 896,
    height: 1200,
  },
  {
    name: "Legal & finance",
    count: "15 types",
    examples: "Injury law · Family law · CPAs",
    image: "/images/who/legal-finance.png",
    width: 1264,
    height: 848,
  },
  {
    name: "Food & drink",
    count: "11 types",
    examples: "Restaurants · Cafes · Bars",
    image: "/images/who/food-drink.png",
    width: 896,
    height: 1200,
  },
] as const;

/** The city on a found card. The page speaks to local businesses in Los Angeles. */
export const CATEGORY_MARKET = "Los Angeles";

type CategoryName = (typeof CATEGORY_ROWS)[number][number];

export type BusinessType = {
  name: CategoryName;
  group: string;
  categories: readonly string[];
};

type CategoryHit = { name: string; type: BusinessType };

const DETAILS: Record<CategoryName, { group: string; categories: readonly string[] }> = {
  Plumbers: {
    group: "Home services",
    categories: ["plumber", "drainage service", "gas installation service", "hot water system supplier", "septic system service"],
  },
  "Med spas": { group: "Health & beauty", categories: ["medical spa", "day spa", "skin care clinic"] },
  "Yoga & pilates studios": { group: "Health & beauty", categories: ["yoga studio", "pilates studio"] },
  Roofers: { group: "Home services", categories: ["roofing contractor", "roof repair"] },
  "Personal injury law": { group: "Legal & finance", categories: ["personal injury attorney", "trial attorney"] },
  Cafes: { group: "Food & drink", categories: ["coffee shop", "cafe"] },
  HVAC: { group: "Home services", categories: ["hvac contractor", "air conditioning contractor"] },
  "Dance studios": { group: "Health & beauty", categories: ["dance school", "dance company"] },
  Accountants: { group: "Legal & finance", categories: ["accountant", "certified public accountant"] },
  "Auto repair": { group: "Auto", categories: ["auto repair shop", "car repair"] },
  "Hair salons": { group: "Health & beauty", categories: ["hair salon", "hairdresser"] },
  Veterinarians: { group: "Pets", categories: ["veterinarian", "animal hospital"] },
  Electricians: { group: "Home services", categories: ["electrician", "electrical installation service"] },
  Restaurants: { group: "Food & drink", categories: ["restaurant", "family restaurant"] },
  "Martial arts": { group: "Health & beauty", categories: ["martial arts school", "karate school"] },
  "Family lawyers": { group: "Legal & finance", categories: ["family law attorney", "divorce lawyer"] },
  Landscapers: { group: "Home services", categories: ["landscaper", "lawn care service"] },
  Bakeries: { group: "Food & drink", categories: ["bakery", "cake shop"] },
  Chiropractors: { group: "Health & beauty", categories: ["chiropractor", "chiropractic clinic"] },
  Movers: { group: "Home services", categories: ["moving company", "moving and storage"] },
  "Insurance agents": { group: "Legal & finance", categories: ["insurance agency", "insurance broker"] },
  Barbers: { group: "Health & beauty", categories: ["barber shop", "barber"] },
  "Pest control": { group: "Home services", categories: ["pest control service", "exterminator"] },
  "Tattoo shops": { group: "Health & beauty", categories: ["tattoo shop", "tattoo artist"] },
  Florists: { group: "Events", categories: ["florist", "flower shop"] },
  "Daycares & preschools": { group: "Education", categories: ["day care center", "preschool"] },
  "Real estate agents": { group: "Legal & finance", categories: ["real estate agency", "real estate agent"] },
  Gyms: { group: "Health & beauty", categories: ["gym", "fitness center"] },
  "Dog trainers": { group: "Pets", categories: ["dog trainer", "pet trainer"] },
  "Wedding venues": { group: "Events", categories: ["wedding venue", "banquet hall"] },
  Locksmiths: { group: "Home services", categories: ["locksmith", "key duplication"] },
  "Nail salons": { group: "Health & beauty", categories: ["nail salon", "manicurist"] },
  Photographers: { group: "Events", categories: ["photographer", "portrait studio"] },
  "Solar installers": { group: "Home services", categories: ["solar energy contractor", "solar panel installer"] },
  Dermatologists: { group: "Health & beauty", categories: ["dermatologist", "skin care clinic"] },
  "Bars & pubs": { group: "Food & drink", categories: ["bar", "pub"] },
  Tutoring: { group: "Education", categories: ["tutoring service", "private tutor"] },
  "Pool services": { group: "Home services", categories: ["swimming pool contractor", "pool cleaning service"] },
  "Immigration lawyers": { group: "Legal & finance", categories: ["immigration attorney", "immigration lawyer"] },
  "Tires & auto glass": { group: "Auto", categories: ["tire shop", "auto glass shop"] },
  "Escape rooms": { group: "Events", categories: ["escape room center", "amusement center"] },
  Jewelers: { group: "Events", categories: ["jeweler", "jewelry store"] },
  "Physical therapy": { group: "Health & beauty", categories: ["physical therapist", "physical therapy clinic"] },
  Painters: { group: "Home services", categories: ["painter", "house painter"] },
  "Music lessons": { group: "Education", categories: ["music school", "music instructor"] },
  "Mortgage brokers": { group: "Legal & finance", categories: ["mortgage broker", "mortgage lender"] },
  "Pet groomers": { group: "Pets", categories: ["pet groomer", "dog groomer"] },
  "General contractors": { group: "Home services", categories: ["general contractor", "remodeler"] },
  Optometrists: { group: "Health & beauty", categories: ["optometrist", "eye care center"] },
  Caterers: { group: "Food & drink", categories: ["caterer", "catering service"] },
  "Language schools": { group: "Education", categories: ["language school", "english language school"] },
  "Window treatments": { group: "Home services", categories: ["window treatment store", "blinds shop"] },
  "Auto detailing": { group: "Auto", categories: ["car detailing service", "auto detailing"] },
  "Cleaning services": { group: "Home services", categories: ["house cleaning service", "janitorial service"] },
  Acupuncture: { group: "Health & beauty", categories: ["acupuncturist", "acupuncture clinic"] },
  "Print shops": { group: "Events", categories: ["print shop", "copy shop"] },
  "Event planners": { group: "Events", categories: ["event planner", "wedding planner"] },
  "Climbing gyms": { group: "Health & beauty", categories: ["rock climbing gym", "indoor climbing"] },
  "Estate planning lawyers": { group: "Legal & finance", categories: ["estate planning attorney", "wills attorney"] },
  "Dry cleaners & tailors": { group: "Events", categories: ["dry cleaner", "tailor"] },
  "Appliance repair": { group: "Home services", categories: ["appliance repair service", "washer and dryer repair"] },
  "Juice & bubble tea": { group: "Food & drink", categories: ["juice shop", "bubble tea store"] },
  "Interior designers": { group: "Events", categories: ["interior designer", "interior decorator"] },
  "Waxing & lash studios": { group: "Health & beauty", categories: ["waxing hair removal service", "eyelash salon"] },
  "IT support": { group: "Events", categories: ["computer support", "it service"] },
  "Breweries & wineries": { group: "Food & drink", categories: ["brewery", "winery"] },
  Flooring: { group: "Home services", categories: ["flooring contractor", "flooring store"] },
  "Funeral homes": { group: "Events", categories: ["funeral home", "cremation service"] },
  "Art classes": { group: "Education", categories: ["art school", "painting class"] },
  "Plastic surgeons": { group: "Health & beauty", categories: ["plastic surgeon", "cosmetic surgeon"] },
  "Garage doors": { group: "Home services", categories: ["garage door supplier", "garage door repair"] },
  "Financial advisors": { group: "Legal & finance", categories: ["financial planner", "financial consultant"] },
  "Motorcycle repair": { group: "Auto", categories: ["motorcycle repair shop", "motorcycle dealer"] },
  Laundromats: { group: "Events", categories: ["laundromat", "laundry service"] },
  "Golf instruction": { group: "Health & beauty", categories: ["golf instructor", "golf course"] },
  "Makeup artists": { group: "Health & beauty", categories: ["make-up artist", "beauty salon"] },
  "Junk removal": { group: "Home services", categories: ["junk removal service", "hauling service"] },
  "Private schools": { group: "Education", categories: ["private school", "elementary school"] },
};

/** Every marquee name, with the group and the Google categories a grade covers. */
export const BUSINESS_TYPES: readonly BusinessType[] = CATEGORY_ROWS.flat().map((name) => ({
  name,
  group: DETAILS[name].group,
  categories: DETAILS[name].categories,
}));

function fold(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Business types whose name matches, then Google categories, in catalog order. An empty query matches nothing. */
export function searchCategories(query: string): { types: BusinessType[]; categories: CategoryHit[] } {
  const needle = fold(query);
  if (!needle) return { types: [], categories: [] };

  const types = BUSINESS_TYPES.filter((type) => fold(type.name).includes(needle));
  const categories = BUSINESS_TYPES.flatMap((type) =>
    type.categories.filter((name) => fold(name).includes(needle)).map((name) => ({ name, type })),
  );

  return { types, categories };
}
