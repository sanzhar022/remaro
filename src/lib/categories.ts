import "server-only";
import { cache } from "react";
import { mapPrismaCategory } from "@/lib/mappers/category";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/types/category";

export const getRootCategories = cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } });
  return categories.map(mapPrismaCategory);
});

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const category = await prisma.category.findUnique({ where: { slug } });
  return category ? mapPrismaCategory(category) : undefined;
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const category = await prisma.category.findUnique({ where: { id } });
  return category ? mapPrismaCategory(category) : undefined;
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  const categories = await prisma.category.findMany({ where: { parentId }, orderBy: { order: "asc" } });
  return categories.map(mapPrismaCategory);
}

export async function getDescendantCategoryIds(categoryId: string): Promise<string[]> {
  const categories = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenByParent = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const children = childrenByParent.get(category.parentId) ?? [];
    children.push(category.id);
    childrenByParent.set(category.parentId, children);
  }

  const ids = [categoryId];
  const visited = new Set(ids);
  for (let index = 0; index < ids.length; index += 1) {
    for (const childId of childrenByParent.get(ids[index]) ?? []) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      ids.push(childId);
    }
  }
  return ids;
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({ where: { featured: true }, orderBy: { order: "asc" } });
  return categories.map(mapPrismaCategory);
}

export async function getCategoryAncestors(category: Category): Promise<Category[]> {
  const ancestors: Category[] = [];
  const visited = new Set<string>();
  let parentId = category.parentId;

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = await getCategoryById(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }

  return ancestors;
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map(({ slug }) => slug);
}
