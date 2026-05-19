"use client";

import { useEffect, useMemo, useState } from "react";
import { Reply, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { CommentRow, UserRow } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommentThreadProps {
  activityId: string;
  initialComments: CommentRow[];
  profiles: UserRow[];
  activeProfileId: string;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CommentThread({
  activityId,
  initialComments,
  profiles,
  activeProfileId,
}: CommentThreadProps) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const profilesById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments-${activityId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `activity_id=eq.${activityId}` },
        (payload) => {
          setComments((prev) => {
            if (payload.eventType === "INSERT") {
              const next = payload.new as CommentRow;
              if (prev.some((c) => c.id === next.id)) return prev;
              return [...prev, next];
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as Partial<CommentRow>;
              return prev.filter((c) => c.id !== old.id);
            }
            return prev;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activityId]);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("comments").insert({
      activity_id: activityId,
      profile_id: activeProfileId,
      parent_comment_id: replyTo,
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBody("");
    setReplyTo(null);
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error(error.message);
  }

  const topLevel = comments.filter((c) => c.parent_comment_id == null);
  const repliesByParent = new Map<string, CommentRow[]>();
  for (const c of comments) {
    if (c.parent_comment_id) {
      const arr = repliesByParent.get(c.parent_comment_id) ?? [];
      arr.push(c);
      repliesByParent.set(c.parent_comment_id, arr);
    }
  }

  const replyingToName = replyTo
    ? profilesById.get(comments.find((c) => c.id === replyTo)?.profile_id ?? "")?.name
    : null;
  const me = profilesById.get(activeProfileId);

  return (
    <section className="bg-paper border border-edge rounded-lg p-5 space-y-4 shadow-card">
      <h2 className="font-serif text-xl font-semibold">
        Comments {comments.length > 0 && <span className="text-ink-muted font-normal">({comments.length})</span>}
      </h2>

      {topLevel.length === 0 ? (
        <p className="text-sm text-ink-muted py-2">No comments yet. Start the thread.</p>
      ) : (
        <ul className="space-y-4">
          {topLevel.map((c) => {
            const author = profilesById.get(c.profile_id);
            if (!author) return null;
            const replies = repliesByParent.get(c.id) ?? [];
            return (
              <li key={c.id} className="space-y-3">
                <CommentRow
                  comment={c}
                  author={author}
                  canDelete={c.profile_id === activeProfileId}
                  onReply={() => setReplyTo(c.id)}
                  onDelete={() => remove(c.id)}
                />
                {replies.length > 0 && (
                  <ul className="ml-11 space-y-3 border-l border-edge pl-4">
                    {replies.map((r) => {
                      const ra = profilesById.get(r.profile_id);
                      if (!ra) return null;
                      return (
                        <li key={r.id}>
                          <CommentRow
                            comment={r}
                            author={ra}
                            canDelete={r.profile_id === activeProfileId}
                            onDelete={() => remove(r.id)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="pt-3 border-t border-edge space-y-2">
        {replyingToName && (
          <div className="text-xs text-ink-muted flex items-center gap-1">
            Replying to <span className="font-medium text-ink">{replyingToName}</span>
            <button onClick={() => setReplyTo(null)} className="ml-1 text-coral hover:underline">
              cancel
            </button>
          </div>
        )}
        <div className="flex gap-2 items-start">
          {me && <Avatar name={me.name} src={me.avatar_url} color={me.display_color} size="sm" className="mt-1" />}
          <div className="flex-1 space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Comment${me ? ` as ${me.name}` : ""}…`}
              rows={2}
              maxLength={4000}
            />
            <div className="flex justify-end">
              <Button onClick={submit} disabled={!body.trim() || submitting} size="sm">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommentRow({
  comment,
  author,
  canDelete,
  onReply,
  onDelete,
}: {
  comment: CommentRow;
  author: UserRow;
  canDelete: boolean;
  onReply?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-3">
      <Avatar name={author.name} src={author.avatar_url} color={author.display_color} size="sm" />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-sm">{author.name}</span>
          <span className="text-xs text-ink-soft">{timeAgo(comment.created_at)}</span>
        </div>
        <p className={cn("text-sm mt-1 whitespace-pre-line text-pretty leading-relaxed")}>
          {comment.body}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {onReply && (
            <button
              onClick={onReply}
              className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-ink-muted hover:text-coral inline-flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
