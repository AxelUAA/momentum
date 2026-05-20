import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    // Durante el build de Next.js (Turbopack workers), los env vars pueden no estar
    // disponibles al evaluar el módulo. Devolvemos un proxy que tira solo al usarse,
    // no al importarse — esto permite que el build compile sin DATABASE_URL.
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === "then") return undefined; // evita que se trate como Promise
        throw new Error(
          "DATABASE_URL no está configurada. Revisa tu .env.local:\n" +
          "  DATABASE_URL=postgresql://user:password@host:port/database"
        );
      },
    });
  }

  // Construimos la URL del pooler sin el parámetro pgbouncer=true
  // ya que el driver adapter pg no es compatible con esa opción de PGBouncer.
  const url = new URL(rawUrl);
  url.searchParams.delete("pgbouncer");

  const adapter = new PrismaPg({ connectionString: url.toString() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// pg keeps a runtime ref para bundlers que hagan tree-shaking del import directo.
void pg;