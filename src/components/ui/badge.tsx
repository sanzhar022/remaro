import type { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "discount" | "new" | "success" | "neutral";

const variants: Record<BadgeVariant, string> = {
  default: "bg-secondary text-primary",
  discount: "bg-[#fde8e8] text-destructive",
  new: "bg-[#e8effd] text-[#315fa7]",
  success: "bg-[#e2f3e9] text-success",
  neutral: "bg-[#ecefed] text-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${variants[variant]} ${className}`} {...props} />;
}
