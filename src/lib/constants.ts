import type { Category, LocationKey } from "./types";

export const TRIP_START = new Date("2026-06-17T00:00:00");
export const TRIP_END = new Date("2026-07-02T00:00:00");

export interface TripDay {
  date: string;
  weekday: string;
  shortLabel: string;
  lodging: "Anchorage" | "Homer" | "Cooper Landing" | "Travel";
  lodgingDetail: string;
  confirmed: boolean;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

function dayLabel(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Confirmed: arrival (Jun 17), Wild River Cottage in Homer (Jun 22-26), departure (Jul 2).
// Everything else is our best guess — Anchorage with Laura & Eric, then Cooper Landing pending.
function lodgingFor(d: Date): { lodging: TripDay["lodging"]; detail: string; confirmed: boolean } {
  const day = d.getDate();
  const m = d.getMonth(); // 0-indexed: 5 = June, 6 = July
  if (m === 5 && day === 17) return { lodging: "Anchorage", detail: "Land at ANC", confirmed: true };
  if (m === 5 && day >= 18 && day <= 19) return { lodging: "Anchorage", detail: "With Laura & Eric (tentative)", confirmed: false };
  if (m === 5 && day === 20) return { lodging: "Anchorage", detail: "Solstice weekend", confirmed: false };
  if (m === 5 && day === 21) return { lodging: "Anchorage", detail: "Solstice Sunday", confirmed: false };
  if (m === 5 && day === 22) return { lodging: "Homer", detail: "Wild River Cottage (check-in)", confirmed: true };
  if (m === 5 && day >= 23 && day <= 25) return { lodging: "Homer", detail: "Wild River Cottage", confirmed: true };
  if (m === 5 && day === 26) return { lodging: "Homer", detail: "Wild River Cottage (check-out)", confirmed: true };
  if (m === 5 && day >= 27 && day <= 29) return { lodging: "Cooper Landing", detail: "Russian River House (pending)", confirmed: false };
  if (m === 5 && day === 30) return { lodging: "Cooper Landing", detail: "Travel day → Anchorage (tentative)", confirmed: false };
  if (m === 6 && day === 1) return { lodging: "Anchorage", detail: "With Laura & Eric (tentative)", confirmed: false };
  if (m === 6 && day === 2) return { lodging: "Anchorage", detail: "Fly home", confirmed: true };
  return { lodging: "Travel", detail: "", confirmed: false };
}

export function tripDays(): TripDay[] {
  const days: TripDay[] = [];
  for (let t = TRIP_START.getTime(); t <= TRIP_END.getTime(); t += ONE_DAY) {
    const d = new Date(t);
    const { lodging, detail, confirmed } = lodgingFor(d);
    days.push({
      date: isoDay(d),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
      shortLabel: dayLabel(d),
      lodging,
      lodgingDetail: detail,
      confirmed,
    });
  }
  return days;
}

export const LOCATIONS: Record<LocationKey, string> = {
  anchorage: "Anchorage",
  homer: "Homer",
  cooper_landing: "Cooper Landing",
  kenai_peninsula: "Kenai Peninsula",
  other: "Other",
};

export const CATEGORIES: Record<Category, string> = {
  outdoors: "Outdoors",
  wildlife: "Wildlife",
  water: "Water",
  culture: "Culture",
  food: "Food & drink",
  town: "Town & shops",
  hike: "Hiking",
  fishing: "Fishing",
  scenic: "Scenic",
};

export const INTENSITY_LABEL = {
  easy: "Easy",
  moderate: "Moderate",
  strenuous: "Strenuous",
} as const;

export const DOG_FRIENDLY_LABEL = {
  yes: "Dog-friendly",
  maybe: "Dog: maybe",
  no: "No dogs",
} as const;

export const VOTE_LABEL = {
  in: "I'm in",
  curious: "Curious",
  pass: "Pass",
} as const;

export const HOUSEHOLDS = {
  co: { label: "Longmont, CO", color: "#0E5E63" },
  ak: { label: "Anchorage, AK", color: "#5A7C5A" },
} as const;

// Curated, geocodable Google Maps queries for each seed activity so the
// embedded map centers on the right place. New/suggested activities fall
// back to a derived query (see mapQueryForActivity).
export const MAP_QUERIES: Record<string, string> = {
  "Anchorage Summer Solstice Festival": "Downtown Anchorage, Alaska",
  "Tony Knowles Coastal Trail": "Tony Knowles Coastal Trail, Anchorage, AK",
  "Anchorage Museum": "Anchorage Museum, Anchorage, AK",
  "Alaska Native Heritage Center": "Alaska Native Heritage Center, Anchorage, AK",
  "Flattop Mountain hike": "Flattop Mountain, Anchorage, AK",
  "Earthquake Park": "Earthquake Park, Anchorage, AK",
  "Potter Marsh boardwalk": "Potter Marsh, Anchorage, AK",
  "Halibut charter (Homer Harbor)": "Homer Harbor, Homer, AK",
  "Kachemak Bay via water taxi": "Kachemak Bay, Alaska",
  "Bishop's Beach": "Bishop's Beach, Homer, AK",
  "Homer Spit": "Homer Spit, Homer, AK",
  "Pratt Museum": "Pratt Museum, Homer, AK",
  "Bunnell Street Arts Center & Old Town galleries": "Bunnell Street Arts Center, Homer, AK",
  "Homer Brewing / Grace Ridge Brewing": "Homer Brewing Company, Homer, AK",
  "Seldovia day trip via ferry": "Seldovia, Alaska",
  "Lake Clark bear viewing flight": "Lake Clark National Park and Preserve, Alaska",
  "Center for Alaskan Coastal Studies tidepool tour": "Center for Alaskan Coastal Studies, Homer, AK",
  "Bald eagle viewing on the Spit": "Homer Spit, Homer, AK",
  "Russian River sockeye fishing": "Russian River Campground, Cooper Landing, AK",
  "Kenai River drift trip with guide": "Kenai River, Cooper Landing, AK",
  "Russian River Falls hike": "Russian River Falls, Cooper Landing, AK",
  "Resurrection Pass Trail": "Resurrection Pass Trail, Cooper Landing, AK",
  "Crescent Creek / Crescent Lake trail": "Crescent Creek Trailhead, Cooper Landing, AK",
  "Kenai Lake": "Kenai Lake, Cooper Landing, AK",
  "Cooper Landing Museum": "Cooper Landing Historical Society Museum, Cooper Landing, AK",
  "Alaska Horsemen Trail Adventures": "Alaska Horsemen Trail Adventures, Cooper Landing, AK",
  "Hidden Lake / Skilak Lake Loop": "Skilak Lake, Sterling, AK",
};

export function mapQueryForActivity(a: {
  title: string;
  location: LocationKey;
  map_query?: string | null;
}): string {
  if (a.map_query && a.map_query.trim()) return a.map_query.trim();
  if (MAP_QUERIES[a.title]) return MAP_QUERIES[a.title];
  const cleanTitle = a.title.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const place = LOCATIONS[a.location] ?? "Alaska";
  return `${cleanTitle}, ${place}, Alaska`;
}
