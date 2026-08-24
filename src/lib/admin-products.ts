"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { adminProductSchema } from "@/lib/admin-product-schema";
import { prisma } from "@/lib/prisma";

export async function getAdminProducts(q = "", page = 1, pageSize = 25) { const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { sku: { contains: q, mode: "insensitive" as const } }, { brand: { contains: q, mode: "insensitive" as const } }] } : undefined; const [items,total]=await Promise.all([prisma.product.findMany({where,include:{category:true},orderBy:{name:"asc"},skip:(page-1)*pageSize,take:pageSize}),prisma.product.count({where})]); return {items,total}; }
export async function getAdminProductById(id: string) { return prisma.product.findUnique({ where: { id }, include: { specifications: { orderBy: { order: "asc" } }, images: { orderBy: { order: "asc" } } } }); }

function parse(data: FormData) {
  let specifications: unknown = [];
  try { specifications = JSON.parse(String(data.get("specifications") ?? "[]")); } catch { /* handled by Zod */ }
  return adminProductSchema.safeParse({ ...Object.fromEntries(data), isPopular: data.has("isPopular"), isNew: data.has("isNew"), isHit: data.has("isHit"), specifications });
}
function refresh(slug: string) { ["/", "/catalog", "/search", `/product/${slug}`].forEach((path) => revalidatePath(path)); revalidatePath("/category/[slug]", "page"); }
function fail(message: string, target: string): never { redirect(`${target}?error=${encodeURIComponent(message)}`); }

export async function createProduct(data: FormData) {
  await requireAdmin(); const parsed = parse(data); if (!parsed.success) fail(parsed.error.issues[0]?.message ?? "Проверьте данные", "/admin/products/new");
  const id = `product-${crypto.randomUUID()}`;
  try { await prisma.$transaction([prisma.product.create({ data: { id, ...parsed.data, oldPrice: parsed.data.oldPrice ?? null, shortDescription: parsed.data.shortDescription || null, description: parsed.data.description || null, specifications: { create: parsed.data.specifications.map((s, order) => ({ ...s, order })) } } })]); }
  catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") fail("Slug или SKU уже используется", "/admin/products/new"); fail("Не удалось сохранить товар", "/admin/products/new"); }
  refresh(parsed.data.slug); redirect("/admin/products");
}

export async function updateProduct(id: string, oldSlug: string, data: FormData) {
  await requireAdmin(); const target=`/admin/products/${id}/edit`; const parsed=parse(data); if(!parsed.success) fail(parsed.error.issues[0]?.message ?? "Проверьте данные",target);
  try { await prisma.$transaction([prisma.product.update({ where:{id}, data:{ ...parsed.data, oldPrice:parsed.data.oldPrice??null, shortDescription:parsed.data.shortDescription||null, description:parsed.data.description||null, specifications:{deleteMany:{},create:parsed.data.specifications.map((s,order)=>({...s,order}))} } })]); }
  catch(e){ if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002") fail("Slug или SKU уже используется",target); fail("Не удалось сохранить товар",target); }
  refresh(oldSlug); refresh(parsed.data.slug); redirect("/admin/products");
}
