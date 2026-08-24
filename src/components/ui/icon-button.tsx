import type { ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "size-9", md: "size-11", lg: "size-13" } as const;

export function IconButton({ size = "md", className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={`inline-grid shrink-0 place-items-center rounded-[var(--radius-md)] text-foreground transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
