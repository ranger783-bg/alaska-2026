"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream focus-visible:ring-kenai active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-kenai text-cream hover:bg-kenai-dark shadow-soft",
        coral:
          "bg-coral text-cream hover:bg-coral-dark shadow-soft",
        secondary:
          "bg-paper text-ink border border-edge hover:border-ink-soft hover:bg-cream-soft",
        outline:
          "bg-transparent text-ink border border-edge hover:border-ink-soft hover:bg-cream-soft",
        ghost:
          "bg-transparent text-ink hover:bg-cream-soft",
        link:
          "bg-transparent text-kenai hover:underline underline-offset-4 px-0",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
