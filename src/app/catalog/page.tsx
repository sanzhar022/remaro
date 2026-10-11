import type { Metadata } from "next";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { getRootCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Каталог товаров",
  description: "Всё необходимое для строительства, ремонта и обустройства дома в каталоге Remaro.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
  const rootCategories = await getRootCategories();

  return (
    <Section>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
      <header className="mb-10 max-w-3xl">
        <h1 className="type-h1">Каталог товаров</h1>
        <p className="mt-4 text-base text-muted sm:text-lg">Всё необходимое для строительства, ремонта и обустройства дома.</p>
      </header>
      <SectionHeader title="Основные категории" description="Выберите нужный раздел каталога" />
      <CategoryGrid categories={rootCategories} />
    </Section>
  );
}
