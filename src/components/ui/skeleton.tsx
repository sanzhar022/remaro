import type { HTMLAttributes } from "react";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[var(--radius-md)] bg-[#e6eae7] ${className}`} {...props} />;
}
