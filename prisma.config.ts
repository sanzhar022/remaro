import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { withVerifiedPostgresTls } from "./src/lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: withVerifiedPostgresTls(env("DATABASE_URL")),
  },
});
