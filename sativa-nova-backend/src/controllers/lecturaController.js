// backend/src/controllers/lecturaController.js
import * as Lectura from '../models/lecturaModel.js';
import { downsampleLecturas } from '../services/lttb.js';
import { calcVPD, vpdZone } from '../services/vpdService.js';
import { procesarLectura } from '../services/alertEngine.js';

const enriquecer = (l) => {
  if (!l) return l;
  const vpd = calcVPD(Number(l.temperatura_ambiente), Number(l.humedad_ambiente));
  return { ...l, vpd, vpd_zona: vpdZone(vpd) };
};

/** POST /api/lecturas — endpoint que consume la Raspberry Pi Pico W. */
export async function crear(req, res, next) {
  try {
    if (req.headers['x-api-key'] !== process.env.DEVICE_API_KEY) return res.status(401).json({ error: 'API key inválida' });
    const b = req.body;
    if (!b.device_id) return res.status(400).json({ error: 'device_id es obligatorio' });
    const nums = ['temperatura_agua','temperatura_ambiente','humedad_ambiente','humedad_suelo','ph','tds_ppm'];
    for (const k of nums) if (b[k] !== undefined && b[k] !== null && Number.isNaN(Number(b[k]))) return res.status(400).json({ error: `${k} debe ser numérico` });

    const lectura = enriquecer(await Lectura.insertar(b));
    const io = req.app.get('io');
    const timers = await procesarLectura(lectura, io);
    io.to(`device:${lectura.device_id}`).emit('lectura:nueva', { ...lectura, alert_timers: timers });
    res.status(201).json(lectura);
  } catch (err) { next(err); }
}

/** GET /api/lecturas/ultima?device_id= */
export async function ultima(req, res, next) {
  try {
    const l = await Lectura.ultima(req.query.device_id);
    if (!l) return res.status(404).json({ error: 'Sin lecturas' });
    res.json(enriquecer(l));
  } catch (err) { next(err); }
}

/**
 * GET /api/lecturas/historico?device_id=&desde=ISO&hasta=ISO&puntos=300
 * Devuelve series downsampleadas por LTTB.
 */
export async function historico(req, res, next) {
  try {
    const { device_id, desde, hasta, puntos = 300 } = req.query;
    if (!device_id || !desde || !hasta) return res.status(400).json({ error: 'device_id, desde y hasta son obligatorios' });
    const rows = await Lectura.rango(device_id, new Date(desde), new Date(hasta));
    const series = downsampleLecturas(rows, Math.min(Number(puntos), 2000), Lectura.VARIABLES);
    res.json({ total_registros: rows.length, puntos_devueltos: Number(puntos), series });
  } catch (err) { next(err); }
}
