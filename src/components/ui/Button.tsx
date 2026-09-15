"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type Variant = ButtonVariant;

export const buttonVariantClasses: Record<Variant, string> = {
  primary:
    "bg-ocean-500 text-white active:bg-ocean-600 disabled:bg-ocean-300 dark:disabled:bg-ocean-800",
  secondary:
    "border border-border-soft bg-surface text-foreground active:bg-surface-muted",
  ghost: "text-ocean-600 dark:text-ocean-300 active:bg-surface-muted",
  danger: "border border-coral-500/40 text-coral-500 active:bg-coral-500/10",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    loading?: boolean;
    fullWidth?: boolean;
  }
>(function Button(
  { variant = "primary", loading, fullWidth = true, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors disabled:opacity-60",
        fullWidth && "w-full",
        buttonVariantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size={18} />}
      {children}
    </button>
  );
});
