"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Home, Plus, X, Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { tripDays } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LOCATIONS } from "@/lib/constants";
import type { ActivityRow, ItineraryItemRow, UserRow, VoteRow } from "@/lib/types";

interface ItineraryViewProps {
  activities: ActivityRow[];
  initialItems: ItineraryItemRow[];
  votes: VoteRow[];
  profiles: UserRow[];
  activeProfileId: string;
}

export function ItineraryView({
  activities,
  initialItems,
  votes,
  profiles,
  activeProfileId,
}: ItineraryViewProps) {
  const [items, setItems] = useState<ItineraryItemRow[]>(initialItems);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const activitiesById = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
  const adultCount = useMemo(() => profiles.filter((p) => p.role === "adult").length, [profiles]);
  const days = tripDays();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("itinerary-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "itinerary_items" },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as Partial<ItineraryItemRow>;
              return prev.filter((i) => i.id !== old.id);
            }
            const next = payload.new as ItineraryItemRow;
            const without = prev.filter((i) => i.id !== next.id);
            return [...without, next];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ItineraryItemRow[]>();
    for (const i of items) {
      const arr = map.get(i.trip_day) ?? [];
      arr.push(i);
      map.set(i.trip_day, arr);
    }
    return map;
  }, [items]);

  const activitiesWithConsensus = useMemo(() => {
    const insByActivity = new Map<string, Set<string>>();
    for (const v of votes) {
      if (v.value !== "in") continue;
      const s = insByActivity.get(v.activity_id) ?? new Set();
      s.add(v.profile_id);
      insByActivity.set(v.activity_id, s);
    }
    const adults = new Set(profiles.filter((p) => p.role === "adult").map((p) => p.id));
    return new Set(
      activities
        .filter((a) => {
          const ins = insByActivity.get(a.id);
          if (!ins) return false;
          let count = 0;
          for (const id of adults) if (ins.has(id)) count++;
          return count === adultCount;
        })
        .map((a) => a.id),
    );
  }, [activities, votes, profiles, adultCount]);

  async function addToDay(activityId: string, day: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("itinerary_items")
      .insert({
        activity_id: activityId,
        trip_day: day,
        time_block: "all_day",
        added_by: activeProfileId,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) setItems((prev) => [...prev, data as ItineraryItemRow]);
    setOpenDay(null);
    setSearch("");
  }

  async function remove(id: string) {
    const before = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const supabase = createClient();
    const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
    if (error) {
      setItems(before);
      toast.error(error.message);
    }
  }

  return (
    <div className="container-prose py-6 md:py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-coral text-xs font-medium uppercase tracking-widest">16 days</p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-balance">The trip, day by day</h1>
        <p className="text-ink-muted text-pretty max-w-2xl">
          Drop activities onto days as the group converges. Multiple per day is fine — we'll figure out the order later.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {days.map((d) => {
          const dayItems = (itemsByDay.get(d.date) ?? [])
            .map((i) => ({ ...i, activity: activitiesById.get(i.activity_id) }))
            .filter((x) => x.activity);
          const isOpen = openDay === d.date;
          const availableActivities = activities
            .filter((a) => !dayItems.some((di) => di.activity_id === a.id))
            .filter((a) =>
              search ? a.title.toLowerCase().includes(search.toLowerCase()) : true,
            );

          return (
            <article key={d.date} className="bg-paper border border-edge rounded-lg p-4 shadow-card flex flex-col">
              <header className="flex items-baseline justify-between gap-2 pb-2 border-b border-edge">
                <div>
                  <div className="font-serif text-lg font-semibold">{d.shortLabel}</div>
                  <div className="text-xs text-ink-muted">{d.weekday}</div>
                </div>
                <Badge
                  variant={d.lodging === "Anchorage" ? "kenai" : d.lodging === "Homer" ? "coral" : "alder"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Home className="h-3 w-3" /> {d.lodging}
                </Badge>
              </header>
              {d.lodgingDetail && (
                <p className="text-[11px] text-ink-soft mt-1">{d.lodgingDetail}</p>
              )}

              <ul className="space-y-1.5 flex-1 my-3 min-h-[24px]">
                {dayItems.length === 0 ? (
                  <li className="text-xs text-ink-soft italic">Nothing scheduled.</li>
                ) : (
                  dayItems.map((di) => (
                    <li
                      key={di.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-md border border-edge bg-cream-soft px-2 py-1.5",
                        activitiesWithConsensus.has(di.activity_id) && "border-coral/40 bg-coral-soft/20",
                      )}
                    >
                      <Link
                        href={`/activities/${di.activity_id}`}
                        className="flex-1 text-sm font-medium hover:text-kenai-dark line-clamp-2"
                      >
                        {di.activity!.title}
                      </Link>
                      <MapPin className="h-3 w-3 text-ink-soft" />
                      <span className="text-[10px] text-ink-soft">
                        {LOCATIONS[di.activity!.location]?.slice(0, 3)}
                      </span>
                      <button
                        onClick={() => remove(di.id)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-ink-soft hover:text-coral transition-opacity"
                        aria-label="Remove from day"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {isOpen ? (
                <div className="space-y-2 pt-2 border-t border-edge">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-soft" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search activities…"
                      className="pl-8 h-9 text-sm"
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-48 overflow-y-auto space-y-1 -mx-1 px-1">
                    {availableActivities.length === 0 ? (
                      <li className="text-xs text-ink-muted py-2 text-center">No matches.</li>
                    ) : (
                      availableActivities.map((a) => (
                        <li key={a.id}>
                          <button
                            onClick={() => addToDay(a.id, d.date)}
                            className="w-full text-left text-sm rounded px-2 py-1.5 hover:bg-cream-soft flex items-center justify-between gap-2"
                          >
                            <span className="line-clamp-1">{a.title}</span>
                            <span className="text-[10px] text-ink-soft shrink-0">
                              {LOCATIONS[a.location]?.slice(0, 3)}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setOpenDay(null); setSearch(""); }}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setOpenDay(d.date)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" /> Add activity
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
