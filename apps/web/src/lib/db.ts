import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const globalForPrisma = globalThis as unknown as {
  __lifeos_prisma?: PrismaClient;
  __lifeos_pg_pool?: Pool;
};

export function getDb() {
  if (process.env.NODE_ENV !== "production") {
    if (!globalForPrisma.__lifeos_pg_pool) {
      globalForPrisma.__lifeos_pg_pool = new Pool({ connectionString });
    }
    if (!globalForPrisma.__lifeos_prisma) {
      const adapter = new PrismaPg(globalForPrisma.__lifeos_pg_pool);
      globalForPrisma.__lifeos_prisma = new PrismaClient({ adapter });
    }
    return globalForPrisma.__lifeos_prisma;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
