import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin";
import { isSameOrigin } from "@/lib/request-security";
import { prisma } from "@/lib/prisma";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/site-settings-schema";

async function authorize() {
  const access = await getAdminAccess();
  if (!access.authenticated) return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  if (!access.authorized) return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  return null;
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;
  const settings = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const denied = await authorize();
  if (denied) return denied;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 }); }
  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте заполненные поля.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { id: SITE_SETTINGS_ID, ...parsed.data },
    update: parsed.data,
  });
  ["/", "/about", "/contacts", "/admin/settings"].forEach((path) => revalidatePath(path));
  revalidatePath("/", "layout");
  return NextResponse.json({ settings, message: "Настройки сохранены" });
}
