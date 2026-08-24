import type { HTMLAttributes } from "react";
import { Container } from "@/components/ui/container";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  contained?: boolean;
}

export function Section({ className = "", contained = true, children, ...props }: SectionProps) {
  const content = contained ? <Container>{children}</Container> : children;
  return <section className={`py-[var(--section-spacing)] ${className}`} {...props}>{content}</section>;
}
