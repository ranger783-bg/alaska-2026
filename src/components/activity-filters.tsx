"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import type { Category, LocationKey, Intensity } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FilterState {
  locations: LocationKey[];
  categories: Category[];
  dogFriendly: boolean;
  kidFriendly: boolean;
  indoor: boolean;
  intensity: Intensity[];
  maxCost: number | null;
}

export const defaultFilters: FilterState = {
  locations: [],
  categories: [],
  dogFriendly: false,
  kidFriendly: false,
  indoor: false,
  intensity: [],
  maxCost: null,
};

interface FiltersProps {
  state: FilterState;
  onChange: (state: FilterState) => void;
  activeCount: number;
  totalCount: number;
}

const LOCATION_KEYS = Object.keys(LOCATIONS) as LocationKey[];
const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export function ActivityFilters({ state, onChange, activeCount, totalCount }: FiltersProps) {
  const [open, setOpen] = useState(false);

  const numActive =
    state.locations.length +
    state.categories.length +
    state.intensity.length +
    (state.dogFriendly ? 1 : 0) +
    (state.kidFriendly ? 1 : 0) +
    (state.indoor ? 1 : 0) +
    (state.maxCost != null ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{activeCount}</span>
          {" "}of{" "}
          <span>{totalCount}</span> activities
        </p>
        <div className="flex items-center gap-2">
          {numActive > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onChange(defaultFilters)}>
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
          <Button
            variant={open ? "primary" : "secondary"}
            size="sm"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <Filter className="h-4 w-4" />
            Filters
            {numActive > 0 && (
              <span className={cn("ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-semibold px-1.5", open ? "bg-cream text-kenai" : "bg-coral text-cream")}>
                {numActive}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Quick chips, always visible */}
      <div className="flex flex-wrap gap-2">
        <Chip
          active={state.dogFriendly}
          onClick={() => onChange({ ...state, dogFriendly: !state.dogFriendly })}
          label="Dog-friendly"
        />
        <Chip
          active={state.kidFriendly}
          onClick={() => onChange({ ...state, kidFriendly: !state.kidFriendly })}
          label="Kid-friendly"
        />
        <Chip
          active={state.indoor}
          onClick={() => onChange({ ...state, indoor: !state.indoor })}
          label="Indoor option"
        />
        {LOCATION_KEYS.filter((k) => k !== "other").map((loc) => (
          <Chip
            key={loc}
            active={state.locations.includes(loc)}
            onClick={() =>
              onChange({
                ...state,
                locations: state.locations.includes(loc)
                  ? state.locations.filter((l) => l !== loc)
                  : [...state.locations, loc],
              })
            }
            label={LOCATIONS[loc]}
          />
        ))}
      </div>

      {open && (
        <div className="bg-paper border border-edge rounded-lg p-5 shadow-card space-y-5">
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-ink-muted">Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_KEYS.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-cream-soft"
                >
                  <Checkbox
                    checked={state.categories.includes(cat)}
                    onCheckedChange={(c) => {
                      onChange({
                        ...state,
                        categories: c
                          ? [...state.categories, cat]
                          : state.categories.filter((x) => x !== cat),
                      });
                    }}
                  />
                  <span className="text-sm">{CATEGORIES[cat]}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-ink-muted">Intensity</Label>
            <div className="flex gap-2 flex-wrap">
              {(["easy", "moderate", "strenuous"] as const).map((i) => (
                <Chip
                  key={i}
                  active={state.intensity.includes(i)}
                  onClick={() =>
                    onChange({
                      ...state,
                      intensity: state.intensity.includes(i)
                        ? state.intensity.filter((x) => x !== i)
                        : [...state.intensity, i],
                    })
                  }
                  label={i.charAt(0).toUpperCase() + i.slice(1)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wider text-ink-muted">Cost ceiling</Label>
            <div className="flex gap-2 flex-wrap">
              {[null, 0, 50, 150, 400].map((max) => (
                <Chip
                  key={String(max)}
                  active={state.maxCost === max}
                  onClick={() => onChange({ ...state, maxCost: max })}
                  label={max == null ? "Any" : max === 0 ? "Free only" : `Under $${max}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-kenai",
        active
          ? "bg-kenai text-cream border-kenai-dark"
          : "bg-paper text-ink-muted border-edge hover:border-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
