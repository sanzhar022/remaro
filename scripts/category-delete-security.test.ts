import assert from "node:assert/strict";
import dotenv from "dotenv";
import { encode } from "@auth/core/jwt";
import { Client } from "pg";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const databaseUrl = process.env.DATABASE_URL;
const secret = process.env.AUTH_SECRET;
if (!databaseUrl || !secret) throw new Error("DATABASE_URL and AUTH_SECRET are required");

type TestUser = { id: string; email: string; role: "ADMIN" | "USER" };
type Counts = { products: number; specifications: number };
const db = new Client({ connectionString: databaseUrl });
await db.connect();

async function integrityCounts(): Promise<Counts> {
  const result = await db.query<{ products: string; specifications: string }>(
    `SELECT (SELECT COUNT(*) FROM "Product") AS products, (SELECT COUNT(*) FROM "ProductSpecification") AS specifications`,
  );
  return { products: Number(result.rows[0].products), specifications: Number(result.rows[0].specifications) };
}

const before = await integrityCounts();
assert.deepEqual(before, { products: 756, specifications: 4895 }, "database baseline does not match the required safety snapshot");
const users = await db.query<TestUser>(`SELECT id, email, role FROM "User" WHERE role IN ('ADMIN', 'USER') ORDER BY role, email`);
const admin = users.rows.find((user) => user.role === "ADMIN");
const regular = users.rows.find((user) => user.role === "USER");
if (!admin || !regular) throw new Error("Both ADMIN and USER are required for the security test");

const productCategory = await db.query<{ id: string }>(`SELECT "categoryId" AS id FROM "Product" GROUP BY "categoryId" ORDER BY COUNT(*) DESC LIMIT 1`);
const parentCategory = await db.query<{ id: string }>(`SELECT "parentId" AS id FROM "Category" WHERE "parentId" IS NOT NULL GROUP BY "parentId" LIMIT 1`);
if (!productCategory.rows[0] || !parentCategory.rows[0]) throw new Error("Product and parent categories are required for conflict tests");

async function cookieFor(user: TestUser) {
  const token = await encode({ token: { id: user.id, sub: user.id, email: user.email, role: user.role }, secret: secret!, salt: "authjs.session-token", maxAge: 300 });
  return `authjs.session-token=${token}`;
}

const endpoint = (id: string) => `http://localhost:3000/api/admin/categories/${encodeURIComponent(id)}`;
const headers = (cookie?: string) => ({ ...(cookie ? { Cookie: cookie } : {}), Origin: "http://localhost:3000" });
const temporaryId = `category-delete-test-${crypto.randomUUID()}`;
const temporarySlug = `category-delete-test-${crypto.randomUUID()}`;
const adminCookie = await cookieFor(admin);
const regularCookie = await cookieFor(regular);
let temporaryCreated = false;

try {
  assert.equal((await fetch(endpoint("missing-category-delete-test"), { method: "DELETE", headers: headers() })).status, 401, "guest DELETE must return 401");
  assert.equal((await fetch(endpoint("missing-category-delete-test"), { method: "DELETE", headers: headers(regularCookie) })).status, 403, "USER DELETE must return 403");
  assert.equal((await fetch(endpoint("missing-category-delete-test"), { method: "DELETE", headers: headers(adminCookie) })).status, 404, "ADMIN nonexistent category must return 404");
  assert.equal((await fetch(endpoint(productCategory.rows[0].id), { method: "DELETE", headers: headers(adminCookie) })).status, 409, "category with products must return 409");
  assert.equal((await fetch(endpoint(parentCategory.rows[0].id), { method: "DELETE", headers: headers(adminCookie) })).status, 409, "category with children must return 409");

  await db.query(
    `INSERT INTO "Category" (id, name, slug, "order", featured, "createdAt", "updatedAt") VALUES ($1, $2, $3, 0, false, NOW(), NOW())`,
    [temporaryId, "Temporary category delete test", temporarySlug],
  );
  temporaryCreated = true;
  const deleted = await fetch(endpoint(temporaryId), { method: "DELETE", headers: headers(adminCookie) });
  assert.equal(deleted.status, 200, `empty category DELETE must succeed: ${await deleted.text()}`);
  temporaryCreated = false;
  assert.equal(Number((await db.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Category" WHERE id = $1`, [temporaryId])).rows[0].count), 0);

  const after = await integrityCounts();
  assert.deepEqual(after, before, "products or specifications changed during category delete tests");
  console.log(JSON.stringify({ guest: 401, user: 403, nonexistent: 404, products: 409, children: 409, empty: 200, temporaryCreated: true, temporaryDeleted: true, before, after }, null, 2));
  console.log("category-delete-security: PASS");
} finally {
  if (temporaryCreated) await db.query(`DELETE FROM "Category" WHERE id = $1`, [temporaryId]);
  await db.end();
}
