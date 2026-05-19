import {
  Trees,
  Bird,
  Waves,
  Landmark,
  UtensilsCrossed,
  MapPin,
  Mountain,
  Fish,
  Camera,
  type LucideIcon,
} from "lucide-react";
import type { Category, LocationKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<Category, LucideIcon> = {
  outdoors: Trees,
  wildlife: Bird,
  water: Waves,
  culture: Landmark,
  food: UtensilsCrossed,
  town: MapPin,
  hike: Mountain,
  fishing: Fish,
  scenic: Camera,
};

const GRADIENTS: Record<LocationKey, string> = {
  anchorage: "from-kenai-dark via-kenai to-kenai-light",
  homer: "from-coral-dark via-coral to-amber-warm",
  cooper_landing: "from-alder-dark via-alder to-alder-light",
  kenai_peninsula: "from-amber-warm via-coral to-coral-dark",
  other: "from-ink via-ink-muted to-ink-soft",
};

interface PlaceholderImageProps {
  categories: Category[];
  location: LocationKey;
  className?: string;
  src?: string | null;
  alt?: string;
}

export function PlaceholderImage({ categories, location, className, src, alt }: PlaceholderImageProps) {
  const primaryCategory = categories[0] ?? "scenic";
  const Icon = ICONS[primaryCategory] ?? Camera;
  const gradient = GRADIENTS[location] ?? GRADIENTS.other;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className={cn("h-full w-full object-cover", className)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn(
        "relative h-full w-full flex items-center justify-center bg-gradient-to-br overflow-hidden",
        gradient,
        className,
      )}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-15"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
      >
        <path d="M0,180 L80,120 L160,160 L240,80 L320,140 L400,100 L400,240 L0,240 Z" fill="white" />
        <path d="M0,200 L60,150 L130,180 L210,120 L280,170 L360,140 L400,160 L400,240 L0,240 Z" fill="white" opacity="0.5" />
      </svg>
      <Icon className="relative h-12 w-12 text-cream/80" strokeWidth={1.5} />
    </div>
  );
}
