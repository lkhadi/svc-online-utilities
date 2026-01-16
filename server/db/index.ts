import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _db: PostgresJsDatabase<typeof schema> | null = null;

function getConnectionString(): string {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_DATABASE;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;

  if (!host || !port || !database || !username || !password) {
    throw new Error(
      `Missing database configuration. Required: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD. ` +
      `Got: host=${host}, port=${port}, database=${database}, username=${username ? '[set]' : '[missing]'}, password=${password ? '[set]' : '[missing]'}`
    );
  }

  return `postgres://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const connectionString = getConnectionString();
    const client = postgres(connectionString);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// For backward compatibility - lazy getter
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});
