import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-cream-soft text-ink-muted border border-edge",
        kenai: "bg-kenai-50 text-kenai-dark",
        alder: "bg-alder/15 text-alder-dark",
        coral: "bg-coral-soft/50 text-coral-dark",
        amber: "bg-amber-warm/15 text-amber-warm",
        outline: "border border-edge text-ink-muted",
        ink: "bg-ink text-cream",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
