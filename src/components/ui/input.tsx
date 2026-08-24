import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = "", "aria-invalid": ariaInvalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={ariaInvalid ?? (error || undefined)}
      className={`h-11 w-full rounded-[var(--radius-md)] border bg-surface px-4 text-foreground shadow-[var(--shadow-sm)] transition placeholder:text-muted/70 hover:border-muted focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-[#f0f2f0] disabled:text-muted ${error ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-border"} ${className}`}
      {...props}
    />
  );
}
