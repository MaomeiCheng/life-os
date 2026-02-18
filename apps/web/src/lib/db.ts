import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __lifeos_prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __lifeos_pg_pool: Pool | undefined;
}

function makeDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = (globalThis.__lifeos_pg_pool ??= new Pool({ connectionString }));
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export function getDb() {
  return (globalThis.__lifeos_prisma ??= makeDb());
}
