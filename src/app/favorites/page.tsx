import type { Metadata } from "next";
import Link from "next/link";
import { FavoritesContent } from "@/components/favorites/favorites-content";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Сохранённые товары в интернет-магазине Remaro.",
};

export default function FavoritesPage() {
  return (
    <Section>
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Избранное</span>
      </nav>
      <h1 className="type-h1 mb-10">Избранное</h1>
      <FavoritesContent />
    </Section>
  );
}
