// backend/src/config/db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

/**
 * Pool de conexiones a Neon. `sslmode=require` viene en la URL y además
 * forzamos SSL aquí por si la variable de entorno se define sin el parámetro.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => console.error('[DB] Error inesperado en cliente inactivo:', err));

/** Helper con logging de consultas lentas. */
export async function query(text, params = []) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const ms = Date.now() - start;
  if (ms > 500) console.warn(`[DB] Consulta lenta (${ms} ms): ${text.slice(0, 80)}…`);
  return res;
}
