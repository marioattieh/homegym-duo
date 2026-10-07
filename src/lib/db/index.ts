import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Supavisor transaction mode does not support prepared statements.
  return drizzle({ client: postgres(url, { prepare: false, max: 3 }), schema });
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

export function getDb() {
  globalForDb.db ??= createDb();
  return globalForDb.db;
}
