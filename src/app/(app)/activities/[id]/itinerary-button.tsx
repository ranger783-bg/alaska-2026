"use client";

import { useState } from "react";
import { Calendar, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tripDays } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ItineraryItemRow } from "@/lib/types";

interface ItineraryButtonProps {
  activityId: string;
  initial: ItineraryItemRow[];
  activeProfileId: string;
}

export function ItineraryButton({ activityId, initial, activeProfileId }: ItineraryButtonProps) {
  const [items, setItems] = useState<ItineraryItemRow[]>(initial);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const days = tripDays();

  async function toggleDay(date: string) {
    setPending(date);
    const supabase = createClient();
    const existing = items.find((i) => i.trip_day === date);
    if (existing) {
      const before = items;
      setItems((prev) => prev.filter((i) => i.id !== existing.id));
      const { error } = await supabase.from("itinerary_items").delete().eq("id", existing.id);
      if (error) {
        setItems(before);
        toast.error(error.message);
      }
    } else {
      const { data, error } = await supabase
        .from("itinerary_items")
        .insert({
          activity_id: activityId,
          trip_day: date,
          time_block: "all_day",
          added_by: activeProfileId,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
      } else if (data) {
        setItems((prev) => [...prev, data as ItineraryItemRow]);
      }
    }
    setPending(null);
  }

  return (
    <section className="bg-paper border border-edge rounded-lg p-5 space-y-3 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">On the itinerary?</h2>
          <p className="text-sm text-ink-muted mt-1">
            {items.length === 0 ? "Not scheduled yet." : `Pinned to ${items.length} ${items.length === 1 ? "day" : "days"}.`}
          </p>
        </div>
        <Button variant={open ? "primary" : "secondary"} size="sm" onClick={() => setOpen((v) => !v)}>
          <Calendar className="h-4 w-4" />
          {open ? "Done" : "Pick days"}
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items
            .slice()
            .sort((a, b) => a.trip_day.localeCompare(b.trip_day))
            .map((i) => {
              const day = days.find((d) => d.date === i.trip_day);
              return (
                <span
                  key={i.id}
                  className="inline-flex items-center gap-1 bg-kenai-50 text-kenai-dark text-xs font-medium px-2 py-1 rounded-full"
                >
                  <Check className="h-3 w-3" />
                  {day?.shortLabel ?? i.trip_day}
                </span>
              );
            })}
        </div>
      )}

      {open && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2 border-t border-edge">
          {days.map((d) => {
            const picked = items.some((i) => i.trip_day === d.date);
            const isPending = pending === d.date;
            return (
              <button
                key={d.date}
                onClick={() => toggleDay(d.date)}
                disabled={isPending}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded text-xs font-medium border transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-kenai",
                  picked
                    ? "bg-kenai border-kenai-dark text-cream"
                    : "bg-cream-soft border-edge text-ink-muted hover:border-ink-soft hover:text-ink",
                  isPending && "opacity-60",
                )}
                title={`${d.weekday} · ${d.lodging}`}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : picked ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3 opacity-30" />
                )}
                <span className="text-[10px] mt-0.5">{d.shortLabel.split(",")[1]?.trim() ?? d.shortLabel}</span>
                <span className="text-[9px] opacity-70">{d.lodging.slice(0, 3)}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
