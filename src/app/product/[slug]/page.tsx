import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDelivery } from "@/components/product/product-delivery";
import { ProductDescription } from "@/components/product/product-description";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductInfo } from "@/components/product/product-info";
import { ProductSpecs } from "@/components/product/product-specs";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { getCategoryAncestors, getCategoryById } from "@/lib/categories";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Товар не найден" };

  const description = product.shortDescription
    ?? product.description
    ?? `${product.name} от ${product.brand} в интернет-магазине Remaro.`;

  return {
    title: { absolute: `${product.name} — Remaro` },
    description: description.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { type: "website", url: absoluteUrl(`/product/${product.slug}`), title: `${product.name} — Remaro`, description: description.slice(0, 160), images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const category = await getCategoryById(product.categoryId);
  if (!category) notFound();

  const [ancestors, relatedProducts] = await Promise.all([
    getCategoryAncestors(category),
    getRelatedProducts(product, 4),
  ]);
  const categoryPath = [...ancestors, category];
  const productJsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.shortDescription ?? product.description ?? product.name, image: product.images.length ? product.images : undefined, sku: product.sku, brand: { "@type": "Brand", name: product.brand }, offers: { "@type": "Offer", url: absoluteUrl(`/product/${product.slug}`), priceCurrency: "KZT", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" } };
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Каталог", item: absoluteUrl("/catalog") }, ...categoryPath.map((item, index) => ({ "@type": "ListItem", position: index + 3, name: item.name, item: absoluteUrl(`/category/${item.slug}`) })), { "@type": "ListItem", position: categoryPath.length + 3, name: product.name, item: absoluteUrl(`/product/${product.slug}`) }] };

  return (
    <Section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex flex-wrap items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalog" className="hover:text-primary">Каталог</Link>
        {categoryPath.map((item) => (
          <span key={item.id} className="contents">
            <span aria-hidden="true">/</span>
            <Link href={`/category/${item.slug}`} className="hover:text-primary">{item.name}</Link>
          </span>
        ))}
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="max-w-full truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo product={product} />
      </div>

      <div className="mt-[var(--section-spacing)] grid gap-6 lg:grid-cols-2 lg:items-start">
        <ProductDescription description={product.description ?? product.shortDescription} productName={product.name} />
        <ProductSpecs brand={product.brand} specifications={product.specifications} />
      </div>

      <div className="mt-[var(--section-spacing)]">
        <ProductDelivery />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-[var(--section-spacing)]">
          <SectionHeader title="Похожие товары" description="Другие товары из этой категории и от выбранного бренда" />
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </Section>
  );
}
