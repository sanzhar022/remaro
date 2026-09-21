import "server-only";
import { cache } from "react";
import { mapPrismaProduct, mapPrismaProductListItem, productListSelect } from "@/lib/mappers/product";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

const specifications = { orderBy: { order: "asc" as const } };
const images = { orderBy: { order: "asc" as const } };
export const publicProductFilter = {
  NOT: {
    OR: [
      { id: { startsWith: "admin-test-" } },
      { slug: { startsWith: "test-" } },
      { slug: { contains: "admin-test" } },
      { name: "Тестовый товар Remaro" },
    ],
  },
};

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: publicProductFilter, select: productListSelect });
  return products.map(mapPrismaProductListItem);
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  const product = await prisma.product.findFirst({ where: { slug, ...publicProductFilter }, include: { specifications, images } });
  return product ? mapPrismaProduct(product) : undefined;
});

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: { categoryId, ...publicProductFilter }, select: productListSelect });
  return products.map(mapPrismaProductListItem);
}

export async function getProductsByCategoryIds(categoryIds: readonly string[]): Promise<Product[]> {
  if (categoryIds.length === 0) return [];
  const products = await prisma.product.findMany({ where: { categoryId: { in: [...categoryIds] }, ...publicProductFilter }, select: productListSelect });
  return products.map(mapPrismaProductListItem);
}

export async function getPopularProducts(limit?: number): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isPopular: true, ...publicProductFilter },
    select: productListSelect,
    take: limit,
  });
  return products.map(mapPrismaProductListItem);
}

export async function getNewProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: { isNew: true, ...publicProductFilter }, select: productListSelect });
  return products.map(mapPrismaProductListItem);
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: { category: { slug }, ...publicProductFilter }, select: productListSelect });
  return products.map(mapPrismaProductListItem);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      categoryId: product.categoryId,
      ...publicProductFilter,
    },
    select: productListSelect,
    take: Math.max(0, limit),
  });
  return products.map(mapPrismaProductListItem);
}

export async function getProductsByIds(ids: readonly string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({ where: { id: { in: [...ids] }, ...publicProductFilter }, select: productListSelect });
  const productsById = new Map(products.map((product) => [product.id, mapPrismaProductListItem(product)]));
  return ids.flatMap((id) => {
    const product = productsById.get(id);
    return product ? [product] : [];
  });
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({ where: publicProductFilter, select: { slug: true } });
  return products.map(({ slug }) => slug);
}
