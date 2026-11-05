// backend/src/controllers/recetaController.js
import * as Receta from '../models/recetaModel.js';

const validar = (r) => {
  const pares = [['ph_min','ph_max'],['ec_min','ec_max'],['temp_agua_min','temp_agua_max'],['temp_amb_min','temp_amb_max'],['hum_min','hum_max']];
  if (!r.nombre?.trim()) return 'El nombre es obligatorio';
  for (const [a, b] of pares) {
    if (Number.isNaN(Number(r[a])) || Number.isNaN(Number(r[b]))) return `${a}/${b} deben ser numéricos`;
    if (Number(r[a]) >= Number(r[b])) return `${a} debe ser menor que ${b}`;
  }
  return null;
};

export const listar = async (_req, res, next) => { try { res.json(await Receta.listar()); } catch (e) { next(e); } };
export const crear = async (req, res, next) => {
  try { const err = validar(req.body); if (err) return res.status(400).json({ error: err }); res.status(201).json(await Receta.crear(req.body)); } catch (e) { next(e); }
};
export const actualizar = async (req, res, next) => {
  try {
    const err = validar(req.body); if (err) return res.status(400).json({ error: err });
    const r = await Receta.actualizar(Number(req.params.id), req.body);
    if (!r) return res.status(404).json({ error: 'Receta no encontrada o es predefinida' });
    res.json(r);
  } catch (e) { next(e); }
};
export const eliminar = async (req, res, next) => {
  try { (await Receta.eliminar(Number(req.params.id))) ? res.status(204).end() : res.status(404).json({ error: 'No se puede eliminar' }); } catch (e) { next(e); }
};
export const activar = async (req, res, next) => {
  try {
    const { device_id, receta_id } = req.body;
    if (!device_id || !receta_id) return res.status(400).json({ error: 'device_id y receta_id son obligatorios' });
    await Receta.activar(device_id, Number(receta_id));
    const activa = await Receta.getActiva(device_id);
    req.app.get('io').to(`device:${device_id}`).emit('receta:activada', activa);
    res.json(activa);
  } catch (e) { next(e); }
};
export const getActiva = async (req, res, next) => {
  try { const r = await Receta.getActiva(req.query.device_id); r ? res.json(r) : res.status(404).json({ error: 'Sin receta activa' }); } catch (e) { next(e); }
};
