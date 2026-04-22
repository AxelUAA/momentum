import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Construimos la URL del pooler sin el parámetro pgbouncer=true
  // ya que el driver adapter pg no es compatible con ese parámetro.
  // Supabase requiere SSL.
  const rawUrl = process.env.DATABASE_URL!;
  const url = new URL(rawUrl);
  url.searchParams.delete("pgbouncer");
  const connectionString = url.toString();

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
