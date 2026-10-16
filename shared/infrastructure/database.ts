import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { AppError } from "@/shared/errors/app-error";

type DatabaseClient = ReturnType<typeof drizzle>;

type DatabaseGlobals = typeof globalThis & {
  __anderCrmNeonPool?: Pool;
  __anderCrmDatabase?: DatabaseClient;
};

const databaseGlobals = globalThis as DatabaseGlobals;

export function getDatabase(): DatabaseClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new AppError("DEPENDENCY_UNAVAILABLE");
  }

  const pool =
    databaseGlobals.__anderCrmNeonPool ??
    new Pool({ connectionString });

  databaseGlobals.__anderCrmNeonPool = pool;

  const database =
    databaseGlobals.__anderCrmDatabase ?? drizzle({ client: pool });

  databaseGlobals.__anderCrmDatabase = database;

  return database;
}

export async function closeDatabasePool(): Promise<void> {
  const pool = databaseGlobals.__anderCrmNeonPool;
  if (!pool) return;
  await pool.end();
  delete databaseGlobals.__anderCrmNeonPool;
  delete databaseGlobals.__anderCrmDatabase;
}
