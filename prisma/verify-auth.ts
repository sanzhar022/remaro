import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [users, categories, products, specifications, authTables] = await Promise.all([
    prisma.user.findMany({ select: { passwordHash: true } }),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productSpecification.count(),
    prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('User', 'Account', 'Session', 'VerificationToken')
      ORDER BY table_name
    `,
  ]);

  console.log(JSON.stringify({
    users: users.length,
    passwordHashesPresent: users.every(({ passwordHash }) => Boolean(passwordHash)),
    passwordHashesUseBcrypt: users.every(({ passwordHash }) => /^\$2[aby]\$12\$/.test(passwordHash ?? "")),
    authTables: authTables.map(({ table_name }) => table_name),
    catalog: { categories, products, specifications },
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
