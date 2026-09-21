"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { adminProductSchema } from "@/lib/admin-product-schema";
import { prisma } from "@/lib/prisma";

export type AdminProductFilters = { search?: string; category?: string; brand?: string; stock?: "in" | "out"; image?: "missing"; sort?: "newest" | "name" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc" };

function productOrderBy(sort: AdminProductFilters["sort"]): Prisma.ProductOrderByWithRelationInput {
  if (sort === "name") return { name: "asc" };
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  if (sort === "stock-asc") return { stock: "asc" };
  if (sort === "stock-desc") return { stock: "desc" };
  return { createdAt: "desc" };
}

export async function getAdminProducts(filters: AdminProductFilters = {}, page = 1, pageSize = 25) {
  const search = filters.search?.trim();
  const where: Prisma.ProductWhereInput = {
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }, { brand: { contains: search, mode: "insensitive" } }] } : {}),
    ...(filters.category ? { categoryId: filters.category } : {}),
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(filters.stock === "in" ? { stock: { gt: 0 } } : filters.stock === "out" ? { stock: 0 } : {}),
    ...(filters.image === "missing" ? { images: { none: {} } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, select: { id: true, slug: true, sku: true, name: true, brand: true, price: true, stock: true, unit: true, isPopular: true, isNew: true, isHit: true, category: { select: { name: true } }, images: { orderBy: { order: "asc" }, take: 1, select: { url: true, alt: true } } }, orderBy: productOrderBy(filters.sort), skip: (page - 1) * pageSize, take: pageSize }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export async function getAdminProductOptions() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true, parentId: true }, orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.product.findMany({ distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
  ]);
  return { categories, brands: brands.map(({ brand }) => brand).filter(Boolean) };
}
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
  if (!await prisma.category.findUnique({where:{id:parsed.data.categoryId},select:{id:true}})) fail("Выбранная категория не найдена", "/admin/products/new");
  const id = `product-${crypto.randomUUID()}`;
  try { await prisma.$transaction([prisma.product.create({ data: { id, ...parsed.data, oldPrice: parsed.data.oldPrice ?? null, shortDescription: parsed.data.shortDescription || null, description: parsed.data.description || null, specifications: { create: parsed.data.specifications.map((s, order) => ({ ...s, order })) } } })]); }
  catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") fail("Товар с таким slug или артикулом уже существует", "/admin/products/new"); fail("Не удалось сохранить товар", "/admin/products/new"); }
  refresh(parsed.data.slug); redirect(`/admin/products/${id}/edit?success=created`);
}

export async function updateProduct(id: string, oldSlug: string, data: FormData) {
  await requireAdmin(); const target=`/admin/products/${id}/edit`; const parsed=parse(data); if(!parsed.success) fail(parsed.error.issues[0]?.message ?? "Проверьте данные",target);
  if (!await prisma.category.findUnique({where:{id:parsed.data.categoryId},select:{id:true}})) fail("Выбранная категория не найдена", target);
  try { await prisma.$transaction([prisma.product.update({ where:{id}, data:{ ...parsed.data, oldPrice:parsed.data.oldPrice??null, shortDescription:parsed.data.shortDescription||null, description:parsed.data.description||null, specifications:{deleteMany:{},create:parsed.data.specifications.map((s,order)=>({...s,order}))} } })]); }
  catch(e){ if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002") fail("Товар с таким slug или артикулом уже существует",target); fail("Не удалось сохранить товар",target); }
  refresh(oldSlug); refresh(parsed.data.slug); redirect(`${target}?success=saved`);
}
