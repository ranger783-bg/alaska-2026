"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "activity-photos";
const MAX_DIM = 1600;

// Downscale large camera photos to <=1600px and re-encode as JPEG to keep
// uploads small. Falls back to the original file if anything goes wrong.
async function prepare(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", 0.85),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

interface PhotoPickerProps {
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
}

export function PhotoPicker({ value, onChange, compact }: PhotoPickerProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await prepare(file);
      const supabase = createClient();
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Photo uploaded.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast.error(
        msg.toLowerCase().includes("bucket")
          ? "Photo storage isn't set up yet — paste a URL instead, or ask Brian."
          : msg,
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Selected"
            className={compact ? "h-16 w-28 object-cover rounded-md border border-edge" : "h-32 w-full max-w-sm object-cover rounded-md border border-edge"}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove photo"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-ink text-cream flex items-center justify-center shadow-soft hover:bg-coral"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex gap-2 items-center">
        <Input
          type="url"
          value={value.startsWith("blob:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL…"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
