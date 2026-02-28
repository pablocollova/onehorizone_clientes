import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
import path from "path";

// fuerza carga del .env que está en backend/.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});