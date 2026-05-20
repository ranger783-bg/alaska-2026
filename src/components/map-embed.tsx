import { MapPin, ExternalLink } from "lucide-react";

interface MapEmbedProps {
  query: string;
  title: string;
}

export function MapEmbed({ query, title }: MapEmbedProps) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=10&output=embed`;
  const openSrc = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className="bg-paper border border-edge rounded-lg overflow-hidden shadow-card">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-kenai" />
          Where it is
        </h2>
        <a
          href={openSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-kenai hover:underline inline-flex items-center gap-1"
        >
          Open in Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <iframe
        title={`Map showing ${title}`}
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="w-full h-64 sm:h-72 border-0 border-t border-edge"
      />
    </section>
  );
}
