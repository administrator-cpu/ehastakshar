import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import { env } from "../config/env.js";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

// Prevent unhandled errors from crashing the Node.js process if the DB disconnects
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
