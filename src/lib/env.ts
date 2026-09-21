import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().or(z.literal("")),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const names = parsed.error.issues.map((issue) => String(issue.path[0] ?? "environment")).join(", ");
  throw new Error(`Invalid server environment configuration: ${names}`);
}

export const serverEnv = parsed.data;
