import "server-only";
import { mapPrismaProduct } from "@/lib/mappers/product";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

const specifications = { orderBy: { order: "asc" as const } };
const images = { orderBy: { order: "asc" as const } };

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ include: { specifications, images } });
  return products.map(mapPrismaProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({ where: { slug }, include: { specifications, images } });
  return product ? mapPrismaProduct(product) : undefined;
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: { categoryId }, include: { specifications, images } });
  return products.map(mapPrismaProduct);
}

export async function getPopularProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isPopular: true,
      NOT: {
        OR: [
          { id: { startsWith: "admin-test-" } },
          { slug: { startsWith: "test-" } },
          { slug: { contains: "admin-test" } },
          { name: "Тестовый товар Remaro" },
        ],
      },
    },
    include: { specifications, images },
  });
  return products.map(mapPrismaProduct);
}

export async function getNewProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: { isNew: true }, include: { specifications, images } });
  return products.map(mapPrismaProduct);
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const products = await prisma.product.findMany({ where: { category: { slug } }, include: { specifications, images } });
  return products.map(mapPrismaProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      OR: [{ categoryId: product.categoryId }, { brand: product.brand }],
    },
    include: { specifications, images },
  });
  return products
    .map(mapPrismaProduct)
    .sort((first, second) => Number(second.categoryId === product.categoryId) - Number(first.categoryId === product.categoryId))
    .slice(0, Math.max(0, limit));
}

export async function getProductsByIds(ids: readonly string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({ where: { id: { in: [...ids] } }, include: { specifications, images } });
  const productsById = new Map(products.map((product) => [product.id, mapPrismaProduct(product)]));
  return ids.flatMap((id) => {
    const product = productsById.get(id);
    return product ? [product] : [];
  });
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map(({ slug }) => slug);
}
