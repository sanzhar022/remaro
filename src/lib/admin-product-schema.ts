import { z } from "zod";

const optionalInt = z.preprocess((v) => v === "" || v == null ? undefined : Number(v), z.number().int().nonnegative().optional());
export const productSpecificationSchema = z.object({ name: z.string().trim().min(1), value: z.string().trim().min(1) });
export const adminProductSchema = z.object({
  name: z.string().trim().min(1), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug должен быть URL-safe, lowercase и латиницей"),
  sku: z.string().trim().min(1), brand: z.string().trim().min(1), categoryId: z.string().min(1),
  shortDescription: z.string().trim().optional(), description: z.string().trim().optional(),
  price: z.coerce.number().int().nonnegative(), oldPrice: optionalInt, stock: z.coerce.number().int().nonnegative(), unit: z.string().trim().min(1),
  rating: z.coerce.number().min(0).max(5), reviewCount: z.coerce.number().int().nonnegative(),
  isPopular: z.boolean(), isNew: z.boolean(), isHit: z.boolean(), specifications: z.array(productSpecificationSchema).max(50),
});
