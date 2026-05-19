import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-md border border-edge bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kenai focus-visible:ring-offset-1 focus-visible:ring-offset-cream",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
