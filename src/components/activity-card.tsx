import Link from "next/link";
import { Dog, Baby, House, Users, Mountain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Avatar } from "@/components/ui/avatar";
import { CATEGORIES, DOG_FRIENDLY_LABEL, LOCATIONS } from "@/lib/constants";
import { formatCostRange, formatDurationHours } from "@/lib/utils";
import type { ActivityRow, UserRow, VoteRow } from "@/lib/types";

interface ActivityCardProps {
  activity: ActivityRow;
  votes: VoteRow[];
  profilesById: Map<string, UserRow>;
  hasConsensus?: boolean;
}

export function ActivityCard({ activity, votes, profilesById, hasConsensus }: ActivityCardProps) {
  const tally = {
    in: votes.filter((v) => v.value === "in"),
    curious: votes.filter((v) => v.value === "curious"),
    pass: votes.filter((v) => v.value === "pass"),
  };

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="group flex flex-col bg-paper border border-edge rounded-lg overflow-hidden shadow-card hover:shadow-lift transition-shadow"
    >
      <div className="relative h-44 sm:h-40 overflow-hidden">
        <PlaceholderImage
          categories={activity.categories}
          location={activity.location}
          src={activity.photo_url}
          alt={activity.title}
        />
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <Badge variant="ink" size="sm">
            {LOCATIONS[activity.location] ?? activity.location}
          </Badge>
          {hasConsensus && (
            <Badge variant="coral" size="sm" className="font-semibold">
              <Users className="h-3 w-3" /> Consensus
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold leading-tight text-balance group-hover:text-kenai-dark transition-colors">
            {activity.title}
          </h3>
          <p className="mt-2 text-sm text-ink-muted line-clamp-2 text-pretty">
            {activity.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {activity.dog_friendly === "yes" && (
            <Badge variant="alder" size="sm" title={DOG_FRIENDLY_LABEL.yes}>
              <Dog className="h-3 w-3" /> Dog
            </Badge>
          )}
          {activity.dog_friendly === "maybe" && (
            <Badge variant="neutral" size="sm" title={DOG_FRIENDLY_LABEL.maybe}>
              <Dog className="h-3 w-3" /> Dog: maybe
            </Badge>
          )}
          {activity.kid_friendly && (
            <Badge variant="kenai" size="sm">
              <Baby className="h-3 w-3" /> Kids
            </Badge>
          )}
          {activity.indoor_option && (
            <Badge variant="neutral" size="sm">
              <House className="h-3 w-3" /> Indoor
            </Badge>
          )}
          {activity.intensity !== "easy" && (
            <Badge variant="neutral" size="sm">
              <Mountain className="h-3 w-3" /> {activity.intensity === "strenuous" ? "Strenuous" : "Moderate"}
            </Badge>
          )}
          {activity.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="outline" size="sm">
              {CATEGORIES[c] ?? c}
            </Badge>
          ))}
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-edge">
          <div className="text-xs">
            <div className="font-medium text-ink">{formatCostRange(activity.cost_low, activity.cost_high)}</div>
            <div className="text-ink-muted">{formatDurationHours(activity.duration_hours)}</div>
          </div>
          <div className="flex items-center gap-2">
            {tally.in.length > 0 && (
              <div className="flex -space-x-1.5">
                {tally.in.slice(0, 4).map((v) => {
                  const p = profilesById.get(v.profile_id);
                  if (!p) return null;
                  return (
                    <Avatar
                      key={v.profile_id}
                      name={p.name}
                      src={p.avatar_url}
                      color={p.display_color}
                      size="xs"
                      title={`${p.name} is in`}
                    />
                  );
                })}
              </div>
            )}
            <div className="text-xs font-medium text-coral">
              {tally.in.length > 0 ? `${tally.in.length} in` : tally.curious.length > 0 ? `${tally.curious.length} curious` : "No votes yet"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
