"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Category, DogFriendly, Intensity, LocationKey } from "@/lib/types";

const LOCATION_KEYS = Object.keys(LOCATIONS) as LocationKey[];
const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

interface SuggestFormProps {
  activeProfileId: string;
  activeProfileName: string;
}

export function SuggestForm({ activeProfileId, activeProfileName }: SuggestFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<LocationKey>("anchorage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [costLow, setCostLow] = useState("");
  const [costHigh, setCostHigh] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<Intensity>("easy");
  const [dogFriendly, setDogFriendly] = useState<DogFriendly>("maybe");
  const [kidFriendly, setKidFriendly] = useState(true);
  const [indoor, setIndoor] = useState(false);
  const [externalLink, setExternalLink] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activities")
      .insert({
        title: title.trim(),
        description: description.trim(),
        notes: notes.trim() || null,
        location,
        categories,
        cost_low: costLow ? Number(costLow) : null,
        cost_high: costHigh ? Number(costHigh) : null,
        duration_hours: duration ? Number(duration) : null,
        intensity,
        dog_friendly: dogFriendly,
        kid_friendly: kidFriendly,
        indoor_option: indoor,
        external_link: externalLink.trim() || null,
        status: "pending",
        submitted_by: activeProfileId,
      })
      .select()
      .single();
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Added to the pending queue.");
    router.push(`/pending`);
    void data;
  }

  return (
    <form onSubmit={onSubmit} className="bg-paper border border-edge rounded-lg p-5 md:p-6 shadow-card space-y-5">
      <p className="text-xs text-ink-muted">
        Submitting as <span className="font-medium text-ink">{activeProfileName}</span>
      </p>

      <Field label="Title" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is it?" required maxLength={120} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location" required>
          <Select value={location} onValueChange={(v) => setLocation(v as LocationKey)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LOCATION_KEYS.map((k) => (
                <SelectItem key={k} value={k}>{LOCATIONS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Intensity">
          <Select value={intensity} onValueChange={(v) => setIntensity(v as Intensity)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="strenuous">Strenuous</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Categories">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORY_KEYS.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-cream-soft">
              <Checkbox
                checked={categories.includes(cat)}
                onCheckedChange={(c) =>
                  setCategories((prev) =>
                    c ? [...prev, cat] : prev.filter((x) => x !== cat),
                  )
                }
              />
              <span className="text-sm">{CATEGORIES[cat]}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Description" required>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required maxLength={2000} placeholder="What is it, what's involved, why the group might like it." />
      </Field>

      <Field label="Notes" hint="Anything specific to our group: dog access, kid age, weather backup, timing.">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Cost from ($)"><Input type="number" min="0" value={costLow} onChange={(e) => setCostLow(e.target.value)} /></Field>
        <Field label="Cost to ($)"><Input type="number" min="0" value={costHigh} onChange={(e) => setCostHigh(e.target.value)} /></Field>
        <Field label="Duration (hr)"><Input type="number" min="0" step="0.5" value={duration} onChange={(e) => setDuration(e.target.value)} /></Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Dog-friendly">
          <Select value={dogFriendly} onValueChange={(v) => setDogFriendly(v as DogFriendly)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="maybe">Maybe / depends</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={kidFriendly} onCheckedChange={(c) => setKidFriendly(!!c)} />
            <span className="text-sm">Kid-friendly</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={indoor} onCheckedChange={(c) => setIndoor(!!c)} />
            <span className="text-sm">Indoor option / weather backup</span>
          </label>
        </div>
      </div>

      <Field label="Link" hint="Optional — official site, blog post, anything for context.">
        <Input type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} placeholder="https://" />
      </Field>

      <div className="flex justify-end gap-2 pt-2 border-t border-edge">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {pending ? "Adding…" : "Add to pending queue"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-coral ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
