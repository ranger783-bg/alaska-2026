"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityCard } from "@/components/activity-card";
import { ActivityFilters, defaultFilters, type FilterState } from "@/components/activity-filters";
import { createClient } from "@/lib/supabase/client";
import type { ActivityRow, UserRow, VoteRow } from "@/lib/types";

interface BrowseClientProps {
  activities: ActivityRow[];
  initialVotes: VoteRow[];
  profiles: UserRow[];
}

export function BrowseClient({ activities, initialVotes, profiles }: BrowseClientProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [votes, setVotes] = useState<VoteRow[]>(initialVotes);

  const profilesById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const adultCount = useMemo(() => profiles.filter((p) => p.role === "adult").length, [profiles]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("votes-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          setVotes((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as Partial<VoteRow>;
              return prev.filter(
                (v) => !(v.profile_id === old.profile_id && v.activity_id === old.activity_id),
              );
            }
            const next = payload.new as VoteRow;
            const without = prev.filter(
              (v) => !(v.profile_id === next.profile_id && v.activity_id === next.activity_id),
            );
            return [...without, next];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (filters.locations.length && !filters.locations.includes(a.location)) return false;
      if (filters.categories.length && !filters.categories.some((c) => a.categories.includes(c))) {
        return false;
      }
      if (filters.dogFriendly && a.dog_friendly === "no") return false;
      if (filters.kidFriendly && !a.kid_friendly) return false;
      if (filters.indoor && !a.indoor_option) return false;
      if (filters.intensity.length && !filters.intensity.includes(a.intensity)) return false;
      if (filters.maxCost != null) {
        const top = a.cost_high ?? a.cost_low ?? 0;
        if (filters.maxCost === 0 && top !== 0) return false;
        if (filters.maxCost > 0 && top > filters.maxCost) return false;
      }
      return true;
    });
  }, [activities, filters]);

  const votesByActivity = useMemo(() => {
    const map = new Map<string, VoteRow[]>();
    for (const v of votes) {
      const arr = map.get(v.activity_id) ?? [];
      arr.push(v);
      map.set(v.activity_id, arr);
    }
    return map;
  }, [votes]);

  return (
    <div className="container-prose py-6 md:py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-coral text-xs font-medium uppercase tracking-widest">June 17 – July 2 · 16 days</p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-balance">
          What we might do in Alaska
        </h1>
        <p className="text-ink-muted text-pretty max-w-2xl">
          Browse the options, vote on what you'd like to do, leave notes for the group. New ideas welcome — hit Suggest.
        </p>
      </header>

      <ActivityFilters
        state={filters}
        onChange={setFilters}
        activeCount={filtered.length}
        totalCount={activities.length}
      />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-ink-muted">
          No activities match those filters. Try clearing one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((activity) => {
            const aVotes = votesByActivity.get(activity.id) ?? [];
            const insBy = new Set(aVotes.filter((v) => v.value === "in").map((v) => v.profile_id));
            const adultsIn = profiles.filter((p) => p.role === "adult" && insBy.has(p.id)).length;
            const hasConsensus = adultsIn === adultCount;
            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                votes={aVotes}
                profilesById={profilesById}
                hasConsensus={hasConsensus}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
