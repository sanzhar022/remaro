import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth-schema";
import { prisma } from "@/lib/prisma";
import { rateLimiter, rateLimitKey } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Недопустимый источник запроса." }, { status: 403 });
  if (!(await rateLimiter.check(rateLimitKey(request, "register"))).allowed) return NextResponse.json({ message: "Слишком много запросов." }, { status: 429 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Проверьте введённые данные.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { firstName, lastName, email, phone, password } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    return NextResponse.json({ message: "Пользователь с таким email уже зарегистрирован." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { email, name: `${firstName} ${lastName}`, firstName, lastName, phone: phone || null, passwordHash },
      select: { id: true, email: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Не удалось создать аккаунт. Попробуйте ещё раз." }, { status: 500 });
  }
}
