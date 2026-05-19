import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { BrowseClient } from "./browse-client";
import type { ActivityRow, UserRow, VoteRow } from "@/lib/types";

export const metadata = { title: "Browse · Alaska 2026" };

export default async function BrowsePage() {
  await requireSession();
  const supabase = await createClient();

  const [{ data: activities }, { data: votes }, { data: profiles }] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("status", "approved")
      .order("location")
      .order("title"),
    supabase.from("votes").select("*"),
    supabase.from("profiles").select("*"),
  ]);

  return (
    <BrowseClient
      activities={(activities ?? []) as ActivityRow[]}
      initialVotes={(votes ?? []) as VoteRow[]}
      profiles={(profiles ?? []) as UserRow[]}
    />
  );
}
