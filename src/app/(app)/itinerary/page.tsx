import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { ItineraryView } from "./itinerary-view";
import type { ActivityRow, ItineraryItemRow, UserRow, VoteRow } from "@/lib/types";

export const metadata = { title: "Itinerary · Alaska 2026" };

export default async function ItineraryPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const [{ data: activities }, { data: items }, { data: votes }, { data: profiles }] = await Promise.all([
    supabase.from("activities").select("*").eq("status", "approved"),
    supabase.from("itinerary_items").select("*").order("trip_day"),
    supabase.from("votes").select("*"),
    supabase.from("profiles").select("*"),
  ]);

  return (
    <ItineraryView
      activities={(activities ?? []) as ActivityRow[]}
      initialItems={(items ?? []) as ItineraryItemRow[]}
      votes={(votes ?? []) as VoteRow[]}
      profiles={(profiles ?? []) as UserRow[]}
      activeProfileId={session.active.id}
    />
  );
}
