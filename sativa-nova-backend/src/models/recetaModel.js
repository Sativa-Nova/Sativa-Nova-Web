// backend/src/models/recetaModel.js
import { query } from '../config/db.js';

const CAMPOS = ['nombre','ph_min','ph_max','ec_min','ec_max','temp_agua_min','temp_agua_max','temp_amb_min','temp_amb_max','hum_min','hum_max'];

export const listar = async () => (await query('SELECT * FROM recetas ORDER BY es_predefinida DESC, nombre')).rows;

export async function crear(r) {
  const vals = CAMPOS.map((c) => r[c]);
  const { rows } = await query(
    `INSERT INTO recetas (${CAMPOS.join(',')}, es_predefinida) VALUES (${CAMPOS.map((_, i) => `$${i + 1}`).join(',')}, FALSE) RETURNING *`, vals);
  return rows[0];
}

export async function actualizar(id, r) {
  const sets = CAMPOS.map((c, i) => `${c} = $${i + 2}`).join(', ');
  const { rows } = await query(`UPDATE recetas SET ${sets} WHERE id = $1 AND es_predefinida = FALSE RETURNING *`, [id, ...CAMPOS.map((c) => r[c])]);
  return rows[0] ?? null;
}

export async function eliminar(id) {
  const { rowCount } = await query('DELETE FROM recetas WHERE id = $1 AND es_predefinida = FALSE', [id]);
  return rowCount > 0;
}

export async function activar(deviceId, recetaId) {
  const { rows } = await query(
    `INSERT INTO cultivo_activo (device_id, receta_id) VALUES ($1,$2)
     ON CONFLICT (device_id) DO UPDATE SET receta_id = EXCLUDED.receta_id, activado_en = NOW()
     RETURNING *`, [deviceId, recetaId]);
  return rows[0];
}

export async function getActiva(deviceId) {
  const { rows } = await query(
    `SELECT r.*, ca.activado_en FROM cultivo_activo ca JOIN recetas r ON r.id = ca.receta_id WHERE ca.device_id = $1`, [deviceId]);
  return rows[0] ?? null;
}
