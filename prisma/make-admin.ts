import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { withVerifiedPostgresTls } from "../src/lib/database-url";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error("Usage: npm run db:make-admin -- user@example.com");

const databaseUrl=process.env.DATABASE_URL;
if(!databaseUrl)throw new Error("DATABASE_URL is required");
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString:withVerifiedPostgresTls(databaseUrl)})});

try {
  const existing = await prisma.user.findUnique({ where: { email }, select: { email: true, role: true } });
  if (!existing) throw new Error("Registered user not found");
  if (existing.role === "ADMIN") {
    console.log(`User ${existing.email} is already ADMIN; no changes made.`);
  } else {
    const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" }, select: { email: true, role: true } });
    console.log(`Updated ${user.email}: ${user.role}`);
  }
} finally {
  await prisma.$disconnect();
}
