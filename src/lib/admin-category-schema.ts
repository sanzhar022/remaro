import { z } from "zod";
export const adminCategorySchema=z.object({name:z.string().trim().min(1),slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,"Slug должен быть URL-safe, lowercase и латиницей"),description:z.string().trim().optional(),parentId:z.string().optional(),order:z.coerce.number().int().nonnegative(),featured:z.boolean()});
