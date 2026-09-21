import "dotenv/config";
import { emitKeypressEvents } from "node:readline";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { withVerifiedPostgresTls } from "../src/lib/database-url";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error("Usage: npm run db:reset-admin-password -- admin@example.com");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

function readHidden(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY || !process.stdin.setRawMode) {
    throw new Error("Run this command in an interactive terminal");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    const stdin = process.stdin;

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("keypress", onKeypress);
      process.stdout.write("\n");
    };

    const onKeypress = (text: string, key: { ctrl?: boolean; name?: string }) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Cancelled"));
      } else if (key.name === "return" || key.name === "enter") {
        cleanup();
        resolve(value);
      } else if (key.name === "backspace") {
        value = value.slice(0, -1);
      } else if (!key.ctrl && text) {
        value += text;
      }
    };

    process.stdout.write(prompt);
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKeypress);
  });
}

function validatePassword(password: string) {
  if (password.length < 12) throw new Error("Password must contain at least 12 characters");
  if (!/\p{L}/u.test(password)) throw new Error("Password must contain at least one letter");
  if (!/\d/.test(password)) throw new Error("Password must contain at least one digit");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: withVerifiedPostgresTls(databaseUrl) }),
});

try {
  const admin = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!admin) throw new Error("User not found");
  if (admin.role !== "ADMIN") throw new Error("Refusing to change password: user is not an ADMIN");

  const password = await readHidden("New password: ");
  validatePassword(password);
  const confirmation = await readHidden("Repeat new password: ");
  if (password !== confirmation) throw new Error("Passwords do not match");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash } });
  console.log(`Password updated for ADMIN ${admin.email}.`);
} finally {
  await prisma.$disconnect();
}
