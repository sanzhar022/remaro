import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const [categoryCount, productCount, specificationCount, tables, duplicateCategorySlugs, duplicateProductSlugs, duplicateSkus] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productSpecification.count(),
    prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('Category', 'Product', 'ProductSpecification')
      ORDER BY table_name
    `,
    prisma.$queryRaw<Array<{ value: string; count: bigint }>>`
      SELECT slug AS value, COUNT(*) AS count FROM "Category" GROUP BY slug HAVING COUNT(*) > 1
    `,
    prisma.$queryRaw<Array<{ value: string; count: bigint }>>`
      SELECT slug AS value, COUNT(*) AS count FROM "Product" GROUP BY slug HAVING COUNT(*) > 1
    `,
    prisma.$queryRaw<Array<{ value: string; count: bigint }>>`
      SELECT sku AS value, COUNT(*) AS count FROM "Product" GROUP BY sku HAVING COUNT(*) > 1
    `,
  ]);

  const plaster = await prisma.category.findUnique({
    where: { slug: "plaster" },
    include: { parent: { include: { parent: true } } },
  });
  const product = await prisma.product.findUnique({
    where: { slug: "knauf-rotband-30kg" },
    include: { category: true, specifications: { orderBy: { order: "asc" } } },
  });

  console.log(JSON.stringify({
    tables: tables.map(({ table_name }) => table_name),
    counts: { categories: categoryCount, products: productCount, specifications: specificationCount },
    duplicates: {
      categorySlugs: duplicateCategorySlugs.length,
      productSlugs: duplicateProductSlugs.length,
      skus: duplicateSkus.length,
    },
    hierarchy: plaster ? [plaster.parent?.parent?.slug, plaster.parent?.slug, plaster.slug] : null,
    product: product ? {
      slug: product.slug,
      category: product.category.slug,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
      rating: product.rating,
      specifications: product.specifications.length,
    } : null,
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
