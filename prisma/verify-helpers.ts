import "dotenv/config";
import {
  getCategoryAncestors,
  getCategoryBySlug,
  getChildCategories,
  getFeaturedCategories,
  getRootCategories,
} from "../src/lib/categories";
import {
  getAllProducts,
  getNewProducts,
  getPopularProducts,
  getProductBySlug,
  getProductsByCategoryId,
  getProductsByCategorySlug,
  getRelatedProducts,
} from "../src/lib/products";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [roots, building, featured, allProducts, plasterProducts, popular, newProducts, product] = await Promise.all([
    getRootCategories(),
    getCategoryBySlug("building-materials"),
    getFeaturedCategories(),
    getAllProducts(),
    getProductsByCategorySlug("plaster"),
    getPopularProducts(),
    getNewProducts(),
    getProductBySlug("knauf-rotband-30kg"),
  ]);

  if (!building || !product) throw new Error("Expected category or product was not found");
  const [buildingChildren, ancestors, productsByCategoryId, related] = await Promise.all([
    getChildCategories(building.id),
    getCategoryAncestors(await getCategoryBySlug("plaster").then((category) => {
      if (!category) throw new Error("Plaster category was not found");
      return category;
    })),
    getProductsByCategoryId(product.categoryId),
    getRelatedProducts(product),
  ]);

  console.log(JSON.stringify({
    rootCategories: roots.length,
    buildingChildren: buildingChildren.length,
    featuredCategories: featured.length,
    ancestors: ancestors.map(({ slug }) => slug),
    allProducts: allProducts.length,
    plasterProducts: plasterProducts.length,
    productsByCategoryId: productsByCategoryId.length,
    popularProducts: popular.length,
    newProducts: newProducts.length,
    productFound: product.slug,
    relatedProducts: related.length,
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
