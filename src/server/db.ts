import type { DriverAdapter } from "@prisma/client/runtime/library";
import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

let adapter: DriverAdapter | null = null;

if (env.TURSO_DATABASE_URL != null && env.TURSO_AUTH_TOKEN != null && env.TURSO_DATABASE_URL.length !== 0 && env.TURSO_AUTH_TOKEN.length !== 0) {
  const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
  const { createClient } = await import("@libsql/client");
  const libsql = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  adapter = new PrismaLibSQL(libsql);
}

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    adapter,
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
