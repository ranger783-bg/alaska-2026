export type UserRole = "adult" | "kid";

export type DogFriendly = "yes" | "no" | "maybe";

export type Intensity = "easy" | "moderate" | "strenuous";

export type ActivityStatus = "approved" | "pending" | "archived";

export type VoteValue = "in" | "curious" | "pass";

export type LocationKey =
  | "anchorage"
  | "homer"
  | "cooper_landing"
  | "kenai_peninsula"
  | "other";

export type Category =
  | "outdoors"
  | "wildlife"
  | "water"
  | "culture"
  | "food"
  | "town"
  | "hike"
  | "fishing"
  | "scenic";

export interface UserRow {
  id: string;
  auth_user_id: string | null;
  managed_by_id: string | null;
  email: string | null;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  household: "co" | "ak";
  display_color: string;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  title: string;
  location: LocationKey;
  categories: Category[];
  description: string;
  notes: string | null;
  photo_url: string | null;
  cost_low: number | null;
  cost_high: number | null;
  duration_hours: number | null;
  intensity: Intensity;
  dog_friendly: DogFriendly;
  kid_friendly: boolean;
  indoor_option: boolean;
  external_link: string | null;
  map_query: string | null;
  status: ActivityStatus;
  submitted_by: string | null;
  created_at: string;
}

export interface VoteRow {
  profile_id: string;
  activity_id: string;
  value: VoteValue;
  created_at: string;
}

export interface CommentRow {
  id: string;
  activity_id: string;
  profile_id: string;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
}

export interface ItineraryItemRow {
  id: string;
  activity_id: string;
  trip_day: string;
  time_block: "morning" | "afternoon" | "evening" | "all_day";
  added_by: string;
  created_at: string;
}

