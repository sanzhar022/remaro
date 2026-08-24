import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [categories, products, specifications, users, orders, orderItems, tables] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productSpecification.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('User', 'Account', 'Session', 'VerificationToken', 'Order', 'OrderItem')
      ORDER BY table_name
    `,
  ]);

  const orderSummary = await prisma.order.findMany({
    select: { userId: true, accessToken: true, subtotal: true, deliveryPrice: true, total: true, _count: { select: { items: true } } },
  });

  console.log(JSON.stringify({
    catalog: { categories, products, specifications },
    users,
    orders,
    orderItems,
    tables: tables.map(({ table_name }) => table_name),
    checks: {
      accessTokensAreSecureLength: orderSummary.every(({ accessToken }) => /^[a-f0-9]{64}$/.test(accessToken)),
      totalsMatch: orderSummary.every((order) => order.total === order.subtotal + order.deliveryPrice),
      everyOrderHasItems: orderSummary.every((order) => order._count.items > 0),
    },
    linkedOrders: orderSummary.filter(({ userId }) => userId !== null).length,
    guestOrders: orderSummary.filter(({ userId }) => userId === null).length,
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
