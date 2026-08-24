import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearFiltersButton, ProductFilters } from "@/components/filters/product-filters";
import { ProductSortSelect } from "@/components/filters/product-sort";
import { ProductGrid } from "@/components/product/product-grid";
import { Section } from "@/components/ui/section";
import { formatProductCount } from "@/lib/format";
import { filterProducts, getAvailableBrands, getPriceRange, parseProductFilters, sortProducts } from "@/lib/product-filters";
import { getAllProducts } from "@/lib/products";
import type { ProductSearchParams } from "@/types/product-filters";

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск строительных материалов в каталоге Remaro.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<ProductSearchParams> }) {
  const query = await searchParams;
  const rawQuery = Array.isArray(query.q) ? query.q[0] : query.q;
  const searchQuery = rawQuery?.trim() ?? "";
  const allProducts = await getAllProducts();
  const matchingSearch = searchQuery ? filterProducts(allProducts, { search: searchQuery }) : [];
  const filters = { ...parseProductFilters(query), search: searchQuery || undefined };
  const results = searchQuery ? sortProducts(filterProducts(allProducts, filters), filters.sort).slice(0, 60) : [];
  const brands = getAvailableBrands(matchingSearch);
  const priceRange = getPriceRange(matchingSearch);

  return (
    <Section>
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Поиск</span>
      </nav>
      <header className="mb-10">
        <h1 className="type-h1">Результаты поиска</h1>
        {searchQuery && <p className="mt-4 text-muted">По запросу «{searchQuery}» найдено: {formatProductCount(results.length)}</p>}
      </header>

      {!searchQuery ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-sm)]">
          <h2 className="type-h2">Введите запрос в строке поиска</h2>
          <p className="mt-3 text-muted">Поиск работает по названию, бренду, артикулу и описанию товара.</p>
        </div>
      ) : matchingSearch.length > 0 ? (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <Suspense fallback={<div className="h-12 rounded-[var(--radius-md)] bg-secondary lg:h-96" />}><ProductFilters brands={brands} priceRange={priceRange} /></Suspense>
          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-muted">{formatProductCount(results.length)}</p>
              <Suspense fallback={<div className="h-11 w-48 rounded-[var(--radius-md)] bg-secondary" />}><ProductSortSelect /></Suspense>
            </div>
            {results.length > 0 ? <ProductGrid products={results} /> : (
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-sm)]">
                <h2 className="type-h2">Ничего не найдено</h2><p className="mt-3 text-muted">Попробуйте изменить параметры фильтрации.</p><Suspense><ClearFiltersButton className="mt-5" /></Suspense>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-sm)]">
          <h2 className="type-h2">По запросу «{searchQuery}» ничего не найдено</h2>
          <p className="mt-3 text-muted">Проверьте написание или попробуйте другой запрос.</p>
        </div>
      )}
    </Section>
  );
}
