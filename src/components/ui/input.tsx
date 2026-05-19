import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-edge bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kenai focus-visible:ring-offset-1 focus-visible:ring-offset-cream",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
