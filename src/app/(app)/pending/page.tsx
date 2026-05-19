import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingList } from "./pending-list";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import type { ActivityRow, UserRow } from "@/lib/types";

export const metadata = { title: "Pending review · Alaska 2026" };

export default async function PendingPage() {
  await requireSession();
  const supabase = await createClient();
  const [{ data: activities }, { data: profiles }] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*"),
  ]);

  return (
    <div className="container-prose py-6 md:py-10 max-w-3xl space-y-6">
      <header className="space-y-2 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-coral text-xs font-medium uppercase tracking-widest">Submitted ideas</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Pending review</h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="/suggest">Suggest another</Link>
        </Button>
      </header>

      {(!activities || activities.length === 0) ? (
        <div className="bg-paper border border-edge rounded-lg p-10 text-center space-y-3 shadow-card">
          <Inbox className="h-10 w-10 mx-auto text-ink-soft" strokeWidth={1.5} />
          <h2 className="font-serif text-xl font-semibold">No pending suggestions</h2>
          <p className="text-ink-muted">When someone suggests a new activity, it lands here for the group to review.</p>
          <Button asChild>
            <Link href="/suggest">Suggest one now</Link>
          </Button>
        </div>
      ) : (
        <PendingList
          activities={activities as ActivityRow[]}
          profiles={(profiles ?? []) as UserRow[]}
        />
      )}
    </div>
  );
}
