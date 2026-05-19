"use client";

import { useEffect, useState } from "react";
import { Check, Heart, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { VOTE_LABEL } from "@/lib/constants";
import type { UserRow, VoteRow, VoteValue } from "@/lib/types";

interface VoteSectionProps {
  activityId: string;
  initialVotes: VoteRow[];
  profiles: UserRow[];
  activeProfileId: string;
  managedProfileIds: string[];
}

const OPTIONS: { value: VoteValue; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { value: "in", icon: Check, tone: "kenai" },
  { value: "curious", icon: Heart, tone: "amber" },
  { value: "pass", icon: X, tone: "neutral" },
];

export function VoteSection({
  activityId,
  initialVotes,
  profiles,
  activeProfileId,
  managedProfileIds,
}: VoteSectionProps) {
  const [votes, setVotes] = useState<VoteRow[]>(initialVotes);
  const [pending, setPending] = useState(false);
  const profilesById = new Map(profiles.map((p) => [p.id, p]));

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`votes-${activityId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `activity_id=eq.${activityId}` },
        (payload) => {
          setVotes((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as Partial<VoteRow>;
              return prev.filter((v) => !(v.profile_id === old.profile_id && v.activity_id === activityId));
            }
            const next = payload.new as VoteRow;
            const without = prev.filter((v) => v.profile_id !== next.profile_id);
            return [...without, next];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activityId]);

  const myVote = votes.find((v) => v.profile_id === activeProfileId)?.value ?? null;

  async function cast(value: VoteValue) {
    if (pending) return;
    setPending(true);
    const supabase = createClient();
    const before = votes;

    if (myVote === value) {
      setVotes((prev) => prev.filter((v) => v.profile_id !== activeProfileId));
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("profile_id", activeProfileId)
        .eq("activity_id", activityId);
      if (error) {
        setVotes(before);
        toast.error(error.message);
      }
    } else {
      const optimistic: VoteRow = {
        profile_id: activeProfileId,
        activity_id: activityId,
        value,
        created_at: new Date().toISOString(),
      };
      setVotes((prev) => [...prev.filter((v) => v.profile_id !== activeProfileId), optimistic]);
      const { error } = await supabase
        .from("votes")
        .upsert(
          { profile_id: activeProfileId, activity_id: activityId, value, updated_at: new Date().toISOString() },
          { onConflict: "profile_id,activity_id" },
        );
      if (error) {
        setVotes(before);
        toast.error(error.message);
      }
    }
    setPending(false);
  }

  const grouped: Record<VoteValue, VoteRow[]> = {
    in: votes.filter((v) => v.value === "in"),
    curious: votes.filter((v) => v.value === "curious"),
    pass: votes.filter((v) => v.value === "pass"),
  };

  const activeProfile = profilesById.get(activeProfileId);
  const votingForOther = activeProfile && !managedProfileIds.includes(activeProfileId);

  return (
    <section className="bg-paper border border-edge rounded-lg p-5 space-y-4 shadow-card">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-serif text-xl font-semibold">How do you feel about it?</h2>
        {activeProfile && (
          <p className="text-xs text-ink-muted">
            Voting as <span className="font-medium text-ink">{activeProfile.name}</span>
            {activeProfile.role === "kid" && " (managed)"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, icon: Icon }) => {
          const selected = myVote === value;
          return (
            <button
              key={value}
              onClick={() => cast(value)}
              disabled={pending || votingForOther}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-md border-2 font-medium text-sm transition-all",
                "focus:outline-none focus:ring-2 focus:ring-kenai focus:ring-offset-2 focus:ring-offset-paper",
                "disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? value === "in"
                    ? "bg-kenai border-kenai-dark text-cream"
                    : value === "curious"
                      ? "bg-amber-warm border-amber-warm text-cream"
                      : "bg-ink border-ink text-cream"
                  : "bg-cream-soft border-edge text-ink-muted hover:border-ink-soft hover:text-ink",
              )}
            >
              <Icon className="h-5 w-5" />
              {VOTE_LABEL[value]}
              <span className="text-xs font-normal opacity-80">{grouped[value].length}</span>
            </button>
          );
        })}
      </div>

      {/* Tally with avatars */}
      <div className="space-y-3 pt-2 border-t border-edge">
        {OPTIONS.map(({ value }) => {
          const list = grouped[value];
          if (list.length === 0) return null;
          return (
            <div key={value} className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-ink-muted w-16">{VOTE_LABEL[value]}</span>
              <div className="flex flex-wrap gap-1.5">
                {list.map((v) => {
                  const p = profilesById.get(v.profile_id);
                  if (!p) return null;
                  return (
                    <div
                      key={v.profile_id}
                      className="inline-flex items-center gap-1.5 bg-cream-soft rounded-full pl-1 pr-2 py-0.5"
                    >
                      <Avatar name={p.name} src={p.avatar_url} color={p.display_color} size="xs" />
                      <span className="text-xs font-medium">{p.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {votes.length === 0 && (
          <p className="text-sm text-ink-muted">Be the first to weigh in.</p>
        )}
      </div>
    </section>
  );
}
