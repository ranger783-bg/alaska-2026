import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCostRange(low: number | null, high: number | null): string {
  if (low == null && high == null) return "Free";
  if (low === 0 && (high === 0 || high == null)) return "Free";
  if (low != null && high != null && low !== high) return `$${low}–$${high}`;
  return `$${low ?? high}`;
}

export function formatDurationHours(hours: number | null): string {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours >= 8) return "Full day";
  if (hours >= 4) return "Half day";
  return `${hours} hr${hours === 1 ? "" : "s"}`;
}
