import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const email = (process.argv[2] ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase();
if (!email) throw new Error("Usage: npm run db:make-admin -- user@example.com");

const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" }, select: { email: true, role: true } });
console.log(`Updated ${user.email}: ${user.role}`);
await prisma.$disconnect();
