"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

interface Adult {
  id: string;
  name: string;
  email: string | null;
  display_color: string;
  household: string;
}

export function LoginForm({
  adults,
  next,
  sent: initialSent,
}: {
  adults: Adult[];
  next?: string;
  sent: boolean;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(initialSent);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    router.replace(`/login?sent=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  if (sent) {
    return (
      <div className="bg-paper border border-edge rounded-lg p-6 shadow-card">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-kenai-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-kenai" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-2">Check your inbox</h2>
          <p className="text-ink-muted text-pretty mb-4">
            We sent a sign-in link. Click it from the same device to land back here.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-paper border border-edge rounded-lg p-6 shadow-card space-y-4">
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {pending ? "Sending link…" : "Send me a sign-in link"}
        </Button>
      </div>

      {adults.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-ink-muted mb-3 uppercase tracking-wider">Planning together</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {adults.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => a.email && setEmail(a.email)}
                className="flex flex-col items-center gap-1 group"
                title={a.email ?? "No email set"}
              >
                <span
                  className="h-10 w-10 rounded-full flex items-center justify-center text-cream text-sm font-semibold ring-2 ring-paper group-hover:ring-kenai transition-all"
                  style={{ background: a.display_color }}
                >
                  {initials(a.name)}
                </span>
                <span className="text-xs text-ink-muted">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
