// backend/src/models/alertaModel.js
import { query } from '../config/db.js';

export async function crear(a) {
  const { rows } = await query(
    `INSERT INTO alertas (device_id, variable, valor, limite_min, limite_max, severidad, mensaje, recomendacion)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [a.device_id, a.variable, a.valor, a.limite_min, a.limite_max, a.severidad, a.mensaje, a.recomendacion]);
  return rows[0];
}
export const listar = async (deviceId, limit = 100) =>
  (await query('SELECT * FROM alertas WHERE device_id = $1 ORDER BY creada_en DESC LIMIT $2', [deviceId, limit])).rows;
export const marcarLeida = async (id) =>
  (await query('UPDATE alertas SET leida = TRUE WHERE id = $1 RETURNING *', [id])).rows[0] ?? null;
export const registrarToken = async (token, deviceId, plataforma) =>
  query(`INSERT INTO dispositivos_push (token, device_id, plataforma) VALUES ($1,$2,$3)
         ON CONFLICT (token) DO UPDATE SET device_id = EXCLUDED.device_id`, [token, deviceId, plataforma]);
