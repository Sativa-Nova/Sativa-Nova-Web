// backend/src/controllers/dosingController.js
import * as Lectura from '../models/lecturaModel.js';
import * as Receta from '../models/recetaModel.js';
import { calcularDosificacion } from '../services/dosingService.js';

/** POST /api/dosificacion { device_id, volumen_l, buffer, ph?, tds_ppm? } */
export async function calcular(req, res, next) {
  try {
    const { device_id, volumen_l, buffer = 'media' } = req.body;
    const receta = await Receta.getActiva(device_id);
    if (!receta) return res.status(409).json({ error: 'Activa una receta antes de calcular la dosificación' });
    const lectura = await Lectura.ultima(device_id);
    const ph = req.body.ph ?? lectura?.ph, tds = req.body.tds_ppm ?? lectura?.tds_ppm;
    if (ph == null || tds == null) return res.status(409).json({ error: 'No hay lectura de pH/TDS disponible' });
    res.json(calcularDosificacion({ volumenL: Number(volumen_l), phActual: Number(ph), tdsActual: Number(tds), receta, buffer }));
  } catch (e) { e.status = 400; next(e); }
}
