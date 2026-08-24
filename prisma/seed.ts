import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { categories } from "../src/data/categories";
import { products } from "../src/data/products";
import type { Category } from "../src/types/category";
import type { Product } from "../src/types/product";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed PostgreSQL");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seedCategories() {
  for (const seedCategory of categories) {
    const category: Category = seedCategory;
    const data = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      order: category.order,
      featured: category.featured ?? false,
    };

    await prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        ...data,
        parent: category.parentId ? { connect: { id: category.parentId } } : undefined,
      },
      update: {
        ...data,
        parent: category.parentId ? { connect: { id: category.parentId } } : { disconnect: true },
      },
    });
  }
}

async function seedProducts() {
  for (const seedProduct of products) {
    const product: Product = seedProduct;
    const data = {
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      brand: product.brand,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.stock,
      unit: product.unit,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isPopular: product.isPopular ?? false,
      isNew: product.isNew ?? false,
      isHit: product.isHit ?? false,
      category: { connect: { id: product.categoryId } },
    };
    const specificationData = product.specifications.map((specification, order) => ({
      name: specification.name,
      value: specification.value,
      order,
    }));

    await prisma.product.upsert({
      where: { id: product.id },
      create: { id: product.id, ...data, specifications: { create: specificationData } },
      update: { ...data, specifications: { deleteMany: {}, create: specificationData } },
    });
  }
}

async function main() {
  await seedCategories();
  await seedProducts();

  const [categoryCount, productCount, specificationCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productSpecification.count(),
  ]);
  console.log(`Seed complete: ${categoryCount} categories, ${productCount} products, ${specificationCount} specifications.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
