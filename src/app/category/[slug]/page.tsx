import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { ClearFiltersButton, ProductFilters } from "@/components/filters/product-filters";
import { ProductSortSelect } from "@/components/filters/product-sort";
import { ProductGrid } from "@/components/product/product-grid";
import { Section } from "@/components/ui/section";
import { getAllCategorySlugs, getCategoryAncestors, getCategoryBySlug, getChildCategories } from "@/lib/categories";
import { formatProductCount } from "@/lib/format";
import { filterProducts, getAvailableBrands, getPriceRange, parseProductFilters, sortProducts } from "@/lib/product-filters";
import { getProductsByCategoryId } from "@/lib/products";
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Категория не найдена" };

  return {
    title: category.name,
    description: category.description ?? `${category.name} в каталоге строительных материалов Remaro.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { type: "website", url: absoluteUrl(`/category/${category.slug}`), title: `${category.name} | Remaro`, description: category.description ?? `${category.name} в каталоге Remaro.`, images: category.image ? [category.image] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const [children, ancestors] = await Promise.all([
    getChildCategories(category.id),
    getCategoryAncestors(category),
  ]);
  const categoryProducts = children.length === 0 ? await getProductsByCategoryId(category.id) : [];
  const filters = parseProductFilters(query);
  const filteredProducts = sortProducts(filterProducts(categoryProducts, filters), filters.sort);
  const brands = getAvailableBrands(categoryProducts);
  const priceRange = getPriceRange(categoryProducts);
  const categoryPath = [...ancestors, category];
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Каталог", item: absoluteUrl("/catalog") }, ...categoryPath.map((item, index) => ({ "@type": "ListItem", position: index + 3, name: item.name, item: absoluteUrl(`/category/${item.slug}`) }))] };

  return (
    <Section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex flex-wrap items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalog" className="hover:text-primary">Каталог</Link>
        {ancestors.map((ancestor) => (
          <span key={ancestor.id} className="contents">
            <span aria-hidden="true">/</span>
            <Link href={`/category/${ancestor.slug}`} className="hover:text-primary">{ancestor.name}</Link>
          </span>
        ))}
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-foreground">{category.name}</span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <h1 className="type-h1">{category.name}</h1>
        {category.description && <p className="mt-4 text-base text-muted sm:text-lg">{category.description}</p>}
      </header>

      {children.length > 0 ? (
        <CategoryGrid categories={children} />
      ) : categoryProducts.length > 0 ? (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <Suspense fallback={<div className="h-12 rounded-[var(--radius-md)] bg-secondary lg:h-96" />}>
            <ProductFilters brands={brands} priceRange={priceRange} showSearch />
          </Suspense>
          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-muted">{formatProductCount(filteredProducts.length)}</p>
              <Suspense fallback={<div className="h-11 w-48 rounded-[var(--radius-md)] bg-secondary" />}><ProductSortSelect /></Suspense>
            </div>
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-sm)]">
                <h2 className="type-h2">Ничего не найдено</h2>
                <p className="mt-3 text-muted">Попробуйте изменить параметры фильтрации.</p>
                <Suspense><ClearFiltersButton className="mt-5" /></Suspense>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-muted shadow-[var(--shadow-sm)] sm:p-8">
          В этой категории пока нет товаров.
        </div>
      )}
    </Section>
  );
}
