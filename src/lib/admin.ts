import "server-only";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) return { authorized: false as const, authenticated: false as const };
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN"
    ? { authorized: true as const, authenticated: true as const, session }
    : { authorized: false as const, authenticated: true as const };
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (!access.authenticated) redirect("/login");
  if (!access.authorized) notFound();
  return access.session;
}
