import assert from "node:assert/strict";
import dotenv from "dotenv";
import { encode } from "@auth/core/jwt";
import { Client } from "pg";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const databaseUrl = process.env.DATABASE_URL;
const secret = process.env.AUTH_SECRET;
if (!databaseUrl || !secret) throw new Error("DATABASE_URL and AUTH_SECRET are required");

const db = new Client({ connectionString: databaseUrl });
await db.connect();
const users = await db.query<{ id: string; email: string; role: "ADMIN" | "USER" }>(
  `SELECT id, email, role FROM "User" WHERE role IN ('ADMIN', 'USER') ORDER BY role, email`,
);
await db.end();

const admin = users.rows.find((user) => user.role === "ADMIN");
const regular = users.rows.find((user) => user.role === "USER");
if (!admin || !regular) throw new Error("Both ADMIN and USER are required for the security test");

type TestUser = { id: string; email: string; role: "ADMIN" | "USER" };
async function cookieFor(user: TestUser) {
  const token = await encode({ token: { id: user.id, sub: user.id, email: user.email, role: user.role }, secret: secret!, salt: "authjs.session-token", maxAge: 300 });
  return `authjs.session-token=${token}`;
}

const endpoint = "http://localhost:3000/api/admin/settings";
const unauthenticated = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: "{}" });
assert.equal(unauthenticated.status, 401, "unauthenticated update must return 401");

const adminCookie = await cookieFor(admin);
const regularCookie = await cookieFor(regular);
const read = await fetch(endpoint, { headers: { Cookie: adminCookie } });
assert.equal(read.status, 200, "ADMIN must be able to read settings");
const original = (await read.json()).settings;
const editableKeys = ["companyName", "shortDescription", "phone", "whatsapp", "email", "workingHours", "city", "address", "latitude", "longitude", "instagramUrl", "tiktokUrl", "aboutTitle", "aboutShortText", "aboutText"];
const originalPayload = Object.fromEntries(editableKeys.map((key) => [key, original[key]]));

const nonAdmin = await fetch(endpoint, { method: "PATCH", headers: { Cookie: regularCookie, "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: JSON.stringify(originalPayload) });
assert.equal(nonAdmin.status, 403, "non-admin update must return 403");

const marker = `${originalPayload.shortDescription ?? ""} [settings-test]`.trim();
try {
  const update = await fetch(endpoint, { method: "PATCH", headers: { Cookie: adminCookie, "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: JSON.stringify({ ...originalPayload, shortDescription: marker }) });
  assert.equal(update.status, 200, "ADMIN must be able to update settings");
  const verify = await fetch(endpoint, { headers: { Cookie: adminCookie } });
  assert.equal((await verify.json()).settings.shortDescription, marker, "ADMIN update must be persisted");
  const publicContacts = await fetch("http://localhost:3000/contacts");
  assert.equal(publicContacts.status, 200, "public contacts page must remain available after update");
  assert.match(await publicContacts.text(), /\[settings-test\]/, "updated settings must be visible on the public page");
} finally {
  const restore = await fetch(endpoint, { method: "PATCH", headers: { Cookie: adminCookie, "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: JSON.stringify(originalPayload) });
  assert.equal(restore.status, 200, "original settings must be restored");
}

console.log("site-settings-security: PASS");
