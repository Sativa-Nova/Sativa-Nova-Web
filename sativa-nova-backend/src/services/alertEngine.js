// backend/src/services/alertEngine.js
/**
 * Motor Time-Over-Threshold con histéresis.
 *
 * Por cada (device, variable) se guarda un estado en memoria:
 *   { fueraDesde: epochMs|null, alertado: bool }
 * - Al salir del rango se arranca el temporizador (fueraDesde).
 * - Si vuelve DENTRO del rango reducido por histéresis, se resetea (evita parpadeo en el borde).
 * - Si el desvío persiste ≥ ALERT_WINDOW_MINUTES, se dispara UNA alerta y se marca `alertado`
 *   hasta que el valor regrese al rango con histéresis.
 */
import { tdsToEc } from './dosingService.js';
import { sendCriticalPush } from './fcmService.js';
import * as AlertaModel from '../models/alertaModel.js';
import * as RecetaModel from '../models/recetaModel.js';

const WINDOW_MS = Number(process.env.ALERT_WINDOW_MINUTES || 15) * 60_000;
const HYST = { ph: Number(process.env.ALERT_HYSTERESIS_PH || 0.1), ec: Number(process.env.ALERT_HYSTERESIS_EC || 0.1) };

const estados = new Map(); // key: `${device}:${variable}`

const RECOMENDACIONES = {
  ph_alto: 'Agregar pH Down (ácido fosfórico) fraccionado. Usa la Calculadora de Dosificación.',
  ph_bajo: 'Agregar pH Up (KOH) en dosis pequeñas y re-medir a los 15 min.',
  ec_alta: 'Diluir con agua limpia hasta el punto medio de la receta.',
  ec_baja: 'Agregar Solución A y B según la Calculadora de Dosificación.',
};

function evaluar(key, valor, min, max, hyst, nowMs) {
  const st = estados.get(key) ?? { fueraDesde: null, alertado: false };
  const fuera = valor < min || valor > max;
  const dentroConHisteresis = valor >= min + hyst && valor <= max - hyst;

  if (fuera) {
    if (st.fueraDesde === null) st.fueraDesde = nowMs;
    const persistio = nowMs - st.fueraDesde >= WINDOW_MS;
    estados.set(key, st);
    if (persistio && !st.alertado) { st.alertado = true; return { disparar: true, restanteMs: 0 }; }
    return { disparar: false, restanteMs: Math.max(0, WINDOW_MS - (nowMs - st.fueraDesde)) };
  }
  if (dentroConHisteresis) estados.set(key, { fueraDesde: null, alertado: false });
  return { disparar: false, restanteMs: null };
}

/**
 * Procesa una lectura recién insertada. Devuelve el estado de los temporizadores
 * para que el dashboard muestre "pH fuera de rango · 9:32 restantes".
 */
export async function procesarLectura(lectura, io) {
  try {
    const receta = await RecetaModel.getActiva(lectura.device_id);
    if (!receta) return null;

    const now = Date.now();
    const ec = tdsToEc(Number(lectura.tds_ppm));
    const checks = [
      { variable: 'ph', valor: Number(lectura.ph), min: Number(receta.ph_min), max: Number(receta.ph_max), hyst: HYST.ph },
      { variable: 'ec', valor: ec, min: Number(receta.ec_min), max: Number(receta.ec_max), hyst: HYST.ec },
    ];

    const timers = {};
    for (const c of checks) {
      if (Number.isNaN(c.valor)) continue;
      const key = `${lectura.device_id}:${c.variable}`;
      const r = evaluar(key, c.valor, c.min, c.max, c.hyst, now);
      timers[c.variable] = r.restanteMs;

      if (r.disparar) {
        const alto = c.valor > c.max;
        const tipo = `${c.variable}_${c.variable === 'ph' ? (alto ? 'alto' : 'bajo') : (alto ? 'alta' : 'baja')}`;
        const unidad = c.variable === 'ph' ? '' : ' mS/cm';
        const mensaje = `${c.variable.toUpperCase()} ${alto ? 'alto' : 'bajo'}: ${c.valor}${unidad} (rango ${c.min}–${c.max}) persiste hace más de ${WINDOW_MS / 60_000} min.`;
        const alerta = await AlertaModel.crear({
          device_id: lectura.device_id, variable: c.variable, valor: c.valor,
          limite_min: c.min, limite_max: c.max, severidad: 'critica',
          mensaje, recomendacion: RECOMENDACIONES[tipo],
        });
        io.to(`device:${lectura.device_id}`).emit('alerta:nueva', alerta);
        await sendCriticalPush(lectura.device_id, {
          title: `⚠️ Desvío químico: ${c.variable.toUpperCase()}`,
          body: mensaje,
          data: { alertaId: alerta.id, variable: c.variable, deviceId: lectura.device_id },
        });
      }
    }
    return timers;
  } catch (err) {
    console.error('[AlertEngine] Error:', err.message);
    return null;
  }
}
