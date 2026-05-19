import type { Category, LocationKey } from "./types";

export const TRIP_START = new Date("2026-06-17T00:00:00");
export const TRIP_END = new Date("2026-07-02T00:00:00");

export interface TripDay {
  date: string;
  weekday: string;
  shortLabel: string;
  lodging: "Anchorage" | "Homer" | "Cooper Landing" | "Travel";
  lodgingDetail: string;
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

function lodgingFor(d: Date): { lodging: TripDay["lodging"]; detail: string } {
  const day = d.getDate();
  const m = d.getMonth(); // 0-indexed: 5 = June, 6 = July
  if (m === 5 && day >= 17 && day <= 21) return { lodging: "Anchorage", detail: "With Laura & Eric" };
  if (m === 5 && day === 22) return { lodging: "Anchorage", detail: "Travel day → Homer" };
  if (m === 5 && day >= 23 && day <= 25) return { lodging: "Homer", detail: "Wild Rose Cottage" };
  if (m === 5 && day === 26) return { lodging: "Homer", detail: "Travel day → Cooper Landing" };
  if (m === 5 && day >= 27 && day <= 29) return { lodging: "Cooper Landing", detail: "Russian River House" };
  if (m === 5 && day === 30) return { lodging: "Cooper Landing", detail: "Travel day → Anchorage" };
  if (m === 6 && day === 1) return { lodging: "Anchorage", detail: "With Laura & Eric" };
  if (m === 6 && day === 2) return { lodging: "Anchorage", detail: "Fly home" };
  return { lodging: "Travel", detail: "" };
}

export function tripDays(): TripDay[] {
  const days: TripDay[] = [];
  for (let t = TRIP_START.getTime(); t <= TRIP_END.getTime(); t += ONE_DAY) {
    const d = new Date(t);
    const { lodging, detail } = lodgingFor(d);
    days.push({
      date: isoDay(d),
      weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
      shortLabel: dayLabel(d),
      lodging,
      lodgingDetail: detail,
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
