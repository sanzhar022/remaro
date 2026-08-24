import type { Prisma } from "@/generated/prisma/client";
import type { Product } from "@/types/product";

export type PrismaProductWithSpecifications = Prisma.ProductGetPayload<{
  include: { specifications: true; images: true };
}>;

export function mapPrismaProduct(product: PrismaProductWithSpecifications): Product {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.shortDescription ?? undefined,
    description: product.description ?? undefined,
    categoryId: product.categoryId,
    brand: product.brand,
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    stock: product.stock,
    unit: product.unit,
    images: product.images.sort((first, second) => first.order - second.order).map(({ url }) => url),
    rating: product.rating,
    reviewCount: product.reviewCount,
    isPopular: product.isPopular,
    isNew: product.isNew,
    isHit: product.isHit,
    specifications: product.specifications
      .sort((first, second) => first.order - second.order)
      .map(({ name, value }) => ({ name, value })),
  };
}
