import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";
import { publicProductFilter } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: publicProductFilter, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/catalog"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/delivery"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contacts"), changeFrequency: "monthly", priority: 0.6 },
    ...categories.map((item) => ({ url: absoluteUrl(`/category/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((item) => ({ url: absoluteUrl(`/product/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
