import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  console.error("Missing DATABASE_URL in env. Ensure apps/web/.env(.local) has it.");
  process.exit(1);
}

const pool = new Pool({ connectionString: datasourceUrl });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

function getArg(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

const email = (getArg("--email") || "").trim().toLowerCase();
const password = getArg("--password") || "";

if (!email || !password) {
  console.error("Usage: node create-admin.mjs --email <email> --password <password> [--name <name>]");
  process.exit(2);
}

const name = getArg("--name") || "Admin";

const isDev = process.env.NODE_ENV !== "production";
const gate = process.env.AUTH_CREATE_ADMIN_ENABLED === "1";

if (!isDev || !gate) {
  console.error("Refusing to run. Set AUTH_CREATE_ADMIN_ENABLED=1 and ensure NODE_ENV!=production.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await db.user.upsert({
  where: { email },
  update: { name, passwordHash },
  create: {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash,
  },
});

console.log(`OK: admin user ensured for ${email}`);

await db.$disconnect();
await pool.end();
