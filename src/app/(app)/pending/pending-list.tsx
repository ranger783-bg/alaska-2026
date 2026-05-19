"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ActivityRow, UserRow } from "@/lib/types";

interface PendingListProps {
  activities: ActivityRow[];
  profiles: UserRow[];
}

export function PendingList({ activities, profiles }: PendingListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const profilesById = new Map(profiles.map((p) => [p.id, p]));

  async function promote(id: string) {
    setPendingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("activities")
      .update({ status: "approved" })
      .eq("id", id);
    setPendingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Promoted to the board.");
    router.refresh();
  }

  async function archive(id: string) {
    setPendingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("activities")
      .update({ status: "archived" })
      .eq("id", id);
    setPendingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => {
        const author = a.submitted_by ? profilesById.get(a.submitted_by) : null;
        const busy = pendingId === a.id;
        return (
          <li key={a.id} className="bg-paper border border-edge rounded-lg p-4 shadow-card">
            <div className="flex items-start gap-3">
              {author && <Avatar name={author.name} src={author.avatar_url} color={author.display_color} size="sm" />}
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-serif text-lg font-semibold">{a.title}</h3>
                  <Badge variant="neutral" size="sm">{LOCATIONS[a.location] ?? a.location}</Badge>
                  {a.categories.slice(0, 2).map((c) => (
                    <Badge key={c} variant="outline" size="sm">{CATEGORIES[c] ?? c}</Badge>
                  ))}
                </div>
                {author && (
                  <p className="text-xs text-ink-muted">
                    Suggested by <span className="font-medium text-ink">{author.name}</span>
                  </p>
                )}
                <p className="text-sm text-ink-muted text-pretty line-clamp-3">{a.description}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => promote(a.id)} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Add to board
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => archive(a.id)} disabled={busy}>
                    <Trash2 className="h-4 w-4" /> Archive
                  </Button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
