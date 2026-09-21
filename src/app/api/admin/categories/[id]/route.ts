import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request-security";

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

function relationError(products: number, children: number) {
  const reasons: string[] = [];
  if (products > 0) reasons.push("Нельзя удалить категорию: к ней привязаны товары.");
  if (children > 0) reasons.push("Нельзя удалить категорию: сначала удалите или перенесите дочерние категории.");
  return reasons.join(" ");
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess();
  if (!access.authenticated) return error("Требуется авторизация.", 401);
  if (!access.authorized) return error("Доступ запрещён.", 403);
  if (!isSameOrigin(request)) return error("Недопустимый источник запроса.", 403);

  const { id } = await params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id }, select: { id: true, slug: true } });
      if (!category) return { status: 404 as const };

      const [products, children] = await Promise.all([
        tx.product.count({ where: { categoryId: id } }),
        tx.category.count({ where: { parentId: id } }),
      ]);
      if (products > 0 || children > 0) return { status: 409 as const, products, children };

      await tx.category.delete({ where: { id } });
      return { status: 200 as const, slug: category.slug };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result.status === 404) return error("Категория не найдена.", 404);
    if (result.status === 409) return error(relationError(result.products, result.children), 409);

    revalidatePath("/admin/categories");
    revalidatePath("/catalog");
    revalidatePath(`/category/${result.slug}`);
    revalidatePath("/category/[slug]", "page");
    return NextResponse.json({ ok: true, message: "Категория удалена" });
  } catch (cause) {
    if (cause instanceof Prisma.PrismaClientKnownRequestError && (cause.code === "P2003" || cause.code === "P2034")) {
      return error("Категорию не удалось удалить: проверьте связанные товары и дочерние категории и повторите попытку.", 409);
    }
    console.error("Category delete failed", cause);
    return error("Не удалось удалить категорию. Попробуйте ещё раз.", 500);
  }
}
