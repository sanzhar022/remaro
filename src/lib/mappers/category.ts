import type { Category as PrismaCategory } from "@/generated/prisma/client";
import type { Category } from "@/types/category";

export function mapPrismaCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    parentId: category.parentId,
    image: category.image ?? undefined,
    icon: category.icon ?? undefined,
    order: category.order,
    featured: category.featured,
  };
}
