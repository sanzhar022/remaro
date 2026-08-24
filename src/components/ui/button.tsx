import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-[var(--shadow-sm)] hover:bg-primary-hover",
  secondary: "bg-secondary text-primary hover:bg-[#dcebe1]",
  outline: "border border-border bg-surface text-foreground hover:border-primary hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary hover:text-primary",
  destructive: "bg-destructive text-white hover:bg-[#a92b2b]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-[var(--radius-sm)] px-3 text-sm",
  md: "h-11 gap-2 rounded-[var(--radius-md)] px-4 text-sm",
  lg: "h-13 gap-2.5 rounded-[var(--radius-md)] px-6 text-base",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `inline-flex shrink-0 items-center justify-center font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName({ variant, size, className })} {...props} />;
}
