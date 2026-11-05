// backend/src/models/lecturaModel.js
import { query } from '../config/db.js';

export const VARIABLES = ['temperatura_agua', 'temperatura_ambiente', 'humedad_ambiente', 'humedad_suelo', 'ph', 'tds_ppm'];

export async function insertar(l) {
  const { rows } = await query(
    `INSERT INTO lecturas (device_id, temperatura_agua, temperatura_ambiente, humedad_ambiente, humedad_suelo, ph, tds_ppm, fecha)
     VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8, NOW())) RETURNING *`,
    [l.device_id, l.temperatura_agua, l.temperatura_ambiente, l.humedad_ambiente, l.humedad_suelo, l.ph, l.tds_ppm, l.fecha ?? null],
  );
  return rows[0];
}

export async function ultima(deviceId) {
  const { rows } = await query(
    'SELECT * FROM lecturas WHERE device_id = $1 ORDER BY fecha DESC LIMIT 1', [deviceId]);
  return rows[0] ?? null;
}

export async function rango(deviceId, desde, hasta, limit = 50_000) {
  const { rows } = await query(
    `SELECT * FROM lecturas WHERE device_id = $1 AND fecha BETWEEN $2 AND $3
     ORDER BY fecha ASC LIMIT $4`, [deviceId, desde, hasta, limit]);
  return rows;
}
