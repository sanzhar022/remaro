import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

export function InfoHero({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <section className="bg-[var(--navy-950)] py-14 text-white sm:py-18 lg:py-22">
      <Container>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{description}</p>
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </section>
  );
}
