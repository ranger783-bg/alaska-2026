"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Calendar, PlusCircle, Inbox, LogOut, UserCog } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { UserRow } from "@/lib/types";

interface NavProps {
  me: UserRow;
  managed: UserRow[];
  active: UserRow;
  pendingCount: number;
}

const navItems = [
  { href: "/", label: "Browse", icon: Compass, match: (p: string) => p === "/" || p.startsWith("/activities") },
  { href: "/itinerary", label: "Itinerary", icon: Calendar, match: (p: string) => p.startsWith("/itinerary") },
  { href: "/suggest", label: "Suggest", icon: PlusCircle, match: (p: string) => p.startsWith("/suggest") },
  { href: "/pending", label: "Pending", icon: Inbox, match: (p: string) => p.startsWith("/pending"), badge: true },
];

export function Nav({ me, managed, active, pendingCount }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function switchProfile(id: string) {
    const res = await fetch("/auth/set-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Couldn't switch profile.");
      return;
    }
    router.refresh();
  }

  async function logout() {
    const res = await fetch("/auth/logout", { method: "POST" });
    if (res.redirected) window.location.href = res.url;
    else window.location.href = "/login";
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-edge">
        <div className="container-prose flex h-14 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-semibold tracking-tight text-kenai-dark">
              Alaska 2026
            </span>
            <span className="hidden sm:inline text-xs text-ink-muted">Jun 17 – Jul 2</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative",
                    isActive ? "bg-paper text-ink shadow-soft" : "text-ink-muted hover:text-ink hover:bg-cream-soft",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && pendingCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-coral text-cream text-[10px] font-semibold px-1.5">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-kenai">
              <Avatar name={active.name} src={active.avatar_url} color={active.display_color} size="sm" />
              <span className="hidden sm:inline text-sm font-medium pr-1">{active.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 text-xs text-ink-muted">
                Signed in as <span className="font-medium text-ink">{me.name}</span>
              </div>
              <DropdownMenuSeparator />
              {[me, ...managed].map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onSelect={() => switchProfile(p.id)}
                  className={cn(p.id === active.id && "bg-cream-soft")}
                >
                  <Avatar name={p.name} src={p.avatar_url} color={p.display_color} size="xs" />
                  <span>Vote as {p.name}</span>
                  {p.role === "kid" && <span className="ml-auto text-[10px] text-ink-soft">kid</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/itinerary"><UserCog className="h-4 w-4" /> Manage trip</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur border-t border-edge pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-3 flex-1 text-[11px] font-medium relative",
                  isActive ? "text-kenai" : "text-ink-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="absolute top-1 right-3 h-4 min-w-4 inline-flex items-center justify-center rounded-full bg-coral text-cream text-[9px] font-bold px-1">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
