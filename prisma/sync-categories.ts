import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { catalogCategories } from "../src/data/catalog-categories";
import { withVerifiedPostgresTls } from "../src/lib/database-url";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: withVerifiedPostgresTls(connectionString) }) });
const apply = process.argv.includes("--apply");

function assertDefinitions() {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const category of catalogCategories) {
    if (ids.has(category.id)) throw new Error(`Duplicate catalog category id: ${category.id}`);
    if (slugs.has(category.slug)) throw new Error(`Duplicate catalog category slug: ${category.slug}`);
    ids.add(category.id);
    slugs.add(category.slug);
    if (category.parentSlug && !catalogCategories.some(({ slug }) => slug === category.parentSlug)) {
      throw new Error(`Missing parent definition for ${category.slug}: ${category.parentSlug}`);
    }
  }
}

async function inspect() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, slug: true, name: true, parentId: true, order: true, featured: true, _count: { select: { products: true } } },
    }),
    prisma.product.findMany({ select: { id: true, categoryId: true } }),
  ]);
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const byId = new Map(categories.map((category) => [category.id, category]));
  const definitionBySlug = new Map(catalogCategories.map((category) => [category.slug, category]));
  const expectedIdBySlug = new Map<string, string>();

  for (const definition of catalogCategories) {
    expectedIdBySlug.set(definition.slug, bySlug.get(definition.slug)?.id ?? definition.id);
  }

  const newCategories = catalogCategories.filter(({ slug }) => !bySlug.has(slug));
  const reusedCategories = catalogCategories.filter(({ slug }) => bySlug.has(slug));
  const idConflicts = newCategories.filter(({ id }) => byId.has(id));
  const hierarchyConflicts = reusedCategories.flatMap((definition) => {
    if (!definition.parentSlug) return [];
    const current = bySlug.get(definition.slug)!;
    const expectedParentId = expectedIdBySlug.get(definition.parentSlug);
    return current.parentId !== expectedParentId
      ? [{ slug: definition.slug, currentParent: byId.get(current.parentId ?? "")?.slug ?? null, plannedParent: definition.parentSlug, productCount: current._count.products }]
      : [];
  });
  const roots = categories.filter(({ parentId }) => parentId === null).length;

  return {
    categories,
    products,
    bySlug,
    byId,
    definitionBySlug,
    expectedIdBySlug,
    newCategories,
    reusedCategories,
    idConflicts,
    hierarchyConflicts,
    counts: { roots, children: categories.length - roots, total: categories.length },
  };
}

async function synchronize() {
  assertDefinitions();
  const before = await inspect();
  const plannedRootCount = catalogCategories.filter(({ parentSlug }) => parentSlug === null).length;

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    before: before.counts,
    plan: {
      definitions: catalogCategories.length,
      plannedRoots: plannedRootCount,
      newCategories: before.newCategories.length,
      reusedCategories: before.reusedCategories.length,
      idConflicts: before.idConflicts.map(({ slug }) => slug),
      hierarchyConflicts: before.hierarchyConflicts,
    },
  }, null, 2));

  if (!apply) return;
  if (before.idConflicts.length > 0) throw new Error("Category id conflicts must be resolved before apply");

  await prisma.$transaction(async (transaction) => {
    const roots = catalogCategories.filter(({ parentSlug }) => parentSlug === null);
    const children = catalogCategories.filter(({ parentSlug }) => parentSlug !== null);
    const newRoots = roots.filter(({ slug }) => !before.bySlug.has(slug));
    const newChildren = children.filter(({ slug }) => !before.bySlug.has(slug));

    if (newRoots.length > 0) {
      await transaction.category.createMany({
        data: newRoots.map((definition) => ({
          id: definition.id,
          slug: definition.slug,
          name: definition.name,
          order: definition.order,
          featured: definition.featured ?? false,
        })),
      });
    }

    if (newChildren.length > 0) {
      await transaction.category.createMany({
        data: newChildren.map((definition) => ({
          id: definition.id,
          slug: definition.slug,
          name: definition.name,
          parentId: before.expectedIdBySlug.get(definition.parentSlug!)!,
          order: definition.order,
        })),
      });
    }

    await Promise.all(roots.flatMap((definition) => {
      const existing = before.bySlug.get(definition.slug);
      const featured = definition.featured ?? false;
      return existing && (existing.order !== definition.order || existing.featured !== featured) ? [transaction.category.update({
        where: { id: existing.id },
        data: { order: definition.order, featured },
      })] : [];
    }));

    await Promise.all(children.flatMap((definition) => {
      const existing = before.bySlug.get(definition.slug);
      const parentId = before.expectedIdBySlug.get(definition.parentSlug!);
      // Existing categories on another branch are deliberately preserved in place.
      return existing && existing.parentId === parentId && existing.order !== definition.order
        ? [transaction.category.update({ where: { id: existing.id }, data: { order: definition.order } })]
        : [];
    }));
  }, { maxWait: 10_000, timeout: 60_000 });

  const after = await inspect();
  const relationChanges = before.products.filter((product) => after.products.find(({ id }) => id === product.id)?.categoryId !== product.categoryId);
  if (after.products.length !== before.products.length || relationChanges.length > 0) {
    throw new Error("Product category relations changed unexpectedly");
  }

  console.log(JSON.stringify({
    result: {
      after: after.counts,
      categoriesAdded: after.categories.length - before.categories.length,
      categoriesDeleted: 0,
      productsDeleted: 0,
      productCategoryRelationsChanged: relationChanges.length,
    },
  }, null, 2));
}

synchronize()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Category sync failed");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
