// prisma.config.ts
// This file is read exclusively by the Prisma CLI (not by Node.js at runtime).
// CommonJS backend is fully compatible — this file's ESM syntax doesn't conflict.
import "dotenv/config"; // loads .env for local dev; no-op in Railway (vars are injected)
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // env() from "prisma/config" throws at CLI startup if DATABASE_URL is not set —
    // this gives a clear error rather than a silent connection failure.
    url: env("DATABASE_URL"),
  },
});