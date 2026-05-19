import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Clock, DollarSign, Mountain, Dog, Baby, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/placeholder-image";
import { VoteSection } from "./vote-section";
import { CommentThread } from "@/components/comment-thread";
import { ItineraryButton } from "./itinerary-button";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { formatCostRange, formatDurationHours } from "@/lib/utils";
import { CATEGORIES, DOG_FRIENDLY_LABEL, INTENSITY_LABEL, LOCATIONS } from "@/lib/constants";
import type { ActivityRow, CommentRow, ItineraryItemRow, UserRow, VoteRow } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const session = await requireSession();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: activity }, { data: profiles }, { data: votes }, { data: comments }, { data: itinerary }] = await Promise.all([
    supabase.from("activities").select("*").eq("id", id).single(),
    supabase.from("profiles").select("*"),
    supabase.from("votes").select("*").eq("activity_id", id),
    supabase.from("comments").select("*").eq("activity_id", id).order("created_at"),
    supabase.from("itinerary_items").select("*").eq("activity_id", id),
  ]);

  if (!activity) notFound();

  const a = activity as ActivityRow;

  return (
    <div className="container-prose py-4 md:py-8 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <article className="space-y-6">
        <div className="relative h-56 md:h-72 rounded-lg overflow-hidden border border-edge">
          <PlaceholderImage
            categories={a.categories}
            location={a.location}
            src={a.photo_url}
            alt={a.title}
          />
        </div>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ink">
              <MapPin className="h-3 w-3" /> {LOCATIONS[a.location] ?? a.location}
            </Badge>
            {a.categories.map((c) => (
              <Badge key={c} variant="outline">
                {CATEGORIES[c] ?? c}
              </Badge>
            ))}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-balance leading-tight">
            {a.title}
          </h1>
        </header>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric icon={DollarSign} label="Cost" value={formatCostRange(a.cost_low, a.cost_high)} />
          <Metric icon={Clock} label="Duration" value={formatDurationHours(a.duration_hours)} />
          <Metric icon={Mountain} label="Intensity" value={INTENSITY_LABEL[a.intensity]} />
          <Metric icon={Dog} label="Dog" value={DOG_FRIENDLY_LABEL[a.dog_friendly]} />
        </dl>

        <div className="flex items-center gap-2 flex-wrap">
          {a.kid_friendly ? (
            <Badge variant="kenai"><Baby className="h-3 w-3" /> Kid-friendly</Badge>
          ) : (
            <Badge variant="neutral">Adults only</Badge>
          )}
          {a.indoor_option && (
            <Badge variant="neutral"><House className="h-3 w-3" /> Indoor option</Badge>
          )}
        </div>

        <div className="prose max-w-none text-ink">
          <p className="text-lg leading-relaxed text-pretty whitespace-pre-line">{a.description}</p>
          {a.notes && (
            <div className="mt-4 p-4 rounded-md bg-cream-soft border border-edge">
              <p className="text-sm font-medium text-ink-muted mb-1">Notes for the group</p>
              <p className="text-pretty whitespace-pre-line">{a.notes}</p>
            </div>
          )}
        </div>

        {a.external_link && (
          <Button variant="secondary" asChild>
            <a href={a.external_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Visit official page
            </a>
          </Button>
        )}

        <VoteSection
          activityId={a.id}
          initialVotes={(votes ?? []) as VoteRow[]}
          profiles={(profiles ?? []) as UserRow[]}
          activeProfileId={session.active.id}
          managedProfileIds={[session.me.id, ...session.managed.map((k) => k.id)]}
        />

        <ItineraryButton
          activityId={a.id}
          initial={(itinerary ?? []) as ItineraryItemRow[]}
          activeProfileId={session.active.id}
        />

        <CommentThread
          activityId={a.id}
          initialComments={(comments ?? []) as CommentRow[]}
          profiles={(profiles ?? []) as UserRow[]}
          activeProfileId={session.active.id}
        />
      </article>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-paper border border-edge rounded-md p-3">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 font-medium text-ink">{value}</div>
    </div>
  );
}
