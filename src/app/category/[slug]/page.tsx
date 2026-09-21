import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { ActiveProductFilters } from "@/components/filters/active-product-filters";
import { ClearFiltersButton, ProductFilters } from "@/components/filters/product-filters";
import { ProductSortSelect } from "@/components/filters/product-sort";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section } from "@/components/ui/section";
import { getAllCategorySlugs, getCategoryAncestors, getCategoryBySlug, getChildCategories, getDescendantCategoryIds } from "@/lib/categories";
import { formatProductCount } from "@/lib/format";
import { filterProducts, getAvailableBrands, getPriceRange, parseProductFilters, sortProducts } from "@/lib/product-filters";
import { getProductsByCategoryIds } from "@/lib/products";
import type { ProductSearchParams } from "@/types/product-filters";
import { absoluteUrl } from "@/lib/site";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductSearchParams>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Категория не найдена" };

  return {
    title: category.name,
    description: category.description ?? `${category.name} в каталоге строительных материалов Remaro.`,
    alternates: { canonical: `/category/${category.slug}` },
    robots: Object.values(query).some((value) => value !== undefined) ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: absoluteUrl(`/category/${category.slug}`), title: `${category.name} | Remaro`, description: category.description ?? `${category.name} в каталоге Remaro.`, images: category.image ? [category.image] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const [children, ancestors, categoryIds] = await Promise.all([
    getChildCategories(category.id),
    getCategoryAncestors(category),
    getDescendantCategoryIds(category.id),
  ]);
  const categoryProducts = await getProductsByCategoryIds(categoryIds);
  const filters = parseProductFilters(query);
  const filteredProducts = sortProducts(filterProducts(categoryProducts, filters), filters.sort);
  const brands = getAvailableBrands(categoryProducts);
  const priceRange = getPriceRange(categoryProducts);
  const categoryPath = [...ancestors, category];
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Каталог", item: absoluteUrl("/catalog") }, ...categoryPath.map((item, index) => ({ "@type": "ListItem", position: index + 3, name: item.name, item: absoluteUrl(`/category/${item.slug}`) }))] };

  return (
    <Section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, ...ancestors.map((ancestor) => ({ label: ancestor.name, href: `/category/${ancestor.slug}` })), { label: category.name }]} />

      <header className="mb-10 max-w-3xl">
        <h1 className="type-h1">{category.name}</h1>
        {category.description && <p className="mt-4 text-base text-muted sm:text-lg">{category.description}</p>}
      </header>

      {children.length > 0 && (
        <section aria-labelledby="subcategories-title" className="mb-12">
          <h2 id="subcategories-title" className="type-h2 mb-6">Подкатегории</h2>
          <CategoryGrid categories={children} />
        </section>
      )}

      {categoryProducts.length > 0 ? (
        <section aria-labelledby="products-title">
          <h2 id="products-title" className="sr-only">Товары категории {category.name}</h2>
        <div className="grid min-w-0 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <Suspense fallback={<div className="h-12 rounded-[var(--radius-md)] bg-secondary lg:h-96" />}>
            <ProductFilters brands={brands} priceRange={priceRange} showSearch />
          </Suspense>
          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-muted">{formatProductCount(filteredProducts.length)}</p>
              <Suspense fallback={<div className="h-11 w-48 rounded-[var(--radius-md)] bg-secondary" />}><ProductSortSelect /></Suspense>
            </div>
            <Suspense><ActiveProductFilters /></Suspense>
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-sm)]">
                <h2 className="type-h2">Ничего не найдено</h2>
                <p className="mt-3 text-muted">Попробуйте изменить параметры фильтрации или сбросить фильтры.</p>
                <Suspense><ClearFiltersButton className="mt-5" /></Suspense>
              </div>
            )}
          </div>
        </div>
        </section>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-center shadow-[var(--shadow-sm)] sm:p-8">
          <h2 className="type-h2">В этой категории товары пока не добавлены</h2>
          <p className="mt-3 text-muted">Посмотрите другие разделы каталога Remaro.</p>
          <Link href="/catalog" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary-hover">
            Вернуться в каталог
          </Link>
        </div>
      )}
    </Section>
  );
}
