// backend/src/services/dosingService.js
/**
 * Calculadora de dosificación agronómica.
 *
 * SUPUESTOS (ajustables desde la UI/env):
 *  - EC (mS/cm) = TDS (ppm) / TDS_FACTOR   (500 = escala NaCl, 700 = escala 4-4-2)
 *  - 1 mL/L de stock concentrado (A+B en conjunto, mitad y mitad) aporta 0.25 mS/cm.
 *  - Densidad de solución stock ≈ 1.15 g/mL (para expresar la dosis también en gramos).
 *  - pH Down (ácido fosfórico ~85%): mL por litro por unidad de pH según la capacidad
 *    amortiguadora (alcalinidad) del agua. Son valores de campo orientativos:
 *      baja  (<50 ppm CaCO3):  0.10 mL/L por pH
 *      media (50-150 ppm):     0.25 mL/L por pH
 *      alta  (>150 ppm):       0.45 mL/L por pH
 *  Siempre se recomienda dosificar en 2-3 fracciones y re-medir.
 */
export const DOSING_DEFAULTS = {
  tdsFactor: Number(process.env.TDS_FACTOR || 500),
  ecPerMlPerL: 0.25,
  stockDensity: 1.15,
  bufferFactors: { baja: 0.10, media: 0.25, alta: 0.45 },
};

export function tdsToEc(tdsPpm, tdsFactor = DOSING_DEFAULTS.tdsFactor) {
  return +(tdsPpm / tdsFactor).toFixed(2);
}

/**
 * @param {object} p
 * @param {number} p.volumenL        Volumen actual del reservorio en litros
 * @param {number} p.phActual
 * @param {number} p.tdsActual       ppm
 * @param {object} p.receta          {ph_min, ph_max, ec_min, ec_max}
 * @param {'baja'|'media'|'alta'} [p.buffer='media']
 */
export function calcularDosificacion({ volumenL, phActual, tdsActual, receta, buffer = 'media', opts = {} }) {
  const cfg = { ...DOSING_DEFAULTS, ...opts };
  if (!(volumenL > 0)) throw new Error('El volumen debe ser mayor que 0 L');

  const ecActual = tdsToEc(tdsActual, cfg.tdsFactor);
  const ecMin = Number(receta.ec_min), ecMax = Number(receta.ec_max);
  const phMin = Number(receta.ph_min), phMax = Number(receta.ph_max);
  const ecObjetivo = +((ecMin + ecMax) / 2).toFixed(2);
  const phObjetivo = +((phMin + phMax) / 2).toFixed(2);

  const pasos = [];
  const resultado = { ecActual, ecObjetivo, phObjetivo, nutrientes: null, phDown: null, pasos, estado: 'ok' };

  // ---- Nutrientes (CE/TDS baja) ----
  if (ecActual < ecMin) {
    const deltaEc = ecObjetivo - ecActual;
    const mlPorLitro = deltaEc / cfg.ecPerMlPerL;         // total A+B
    const mlTotal = mlPorLitro * volumenL;
    const mlA = +(mlTotal / 2).toFixed(1);
    const mlB = +(mlTotal / 2).toFixed(1);
    resultado.nutrientes = {
      deltaEc: +deltaEc.toFixed(2),
      solucionA_mL: mlA, solucionA_g: +(mlA * cfg.stockDensity).toFixed(1),
      solucionB_mL: mlB, solucionB_g: +(mlB * cfg.stockDensity).toFixed(1),
    };
    pasos.push(`Agregar ${mlA} mL (${resultado.nutrientes.solucionA_g} g) de Solución A al reservorio.`);
    pasos.push('Agitar o recircular durante 5 minutos para disolver completamente.');
    pasos.push(`Agregar ${mlB} mL (${resultado.nutrientes.solucionB_g} g) de Solución B. Nunca mezclar A y B concentrados entre sí.`);
    pasos.push('Esperar 15 minutos y verificar la lectura de CE antes de ajustar pH.');
    resultado.estado = 'corregir';
  } else if (ecActual > ecMax) {
    // Dilución: V_agua = V * (EC_actual/EC_obj - 1)
    const aguaL = +(volumenL * (ecActual / ecObjetivo - 1)).toFixed(1);
    resultado.nutrientes = { diluirConAguaL: aguaL };
    pasos.push(`La CE está alta. Agregar ${aguaL} L de agua limpia (o reemplazar parcialmente) para bajar a ${ecObjetivo} mS/cm.`);
    resultado.estado = 'corregir';
  }

  // ---- pH Down (pH alto) ----
  if (phActual > phMax) {
    const factor = cfg.bufferFactors[buffer] ?? cfg.bufferFactors.media;
    const deltaPh = phActual - phObjetivo;
    const mlPhDown = +(deltaPh * factor * volumenL).toFixed(1);
    resultado.phDown = { deltaPh: +deltaPh.toFixed(2), mL: mlPhDown, buffer };
    pasos.push(`Agregar ${mlPhDown} mL de pH Down (ácido fosfórico) en 2–3 fracciones, agitando y re-midiendo entre cada una.`);
    resultado.estado = 'corregir';
  } else if (phActual < phMin) {
    resultado.phDown = { deltaPh: +(phActual - phObjetivo).toFixed(2), mL: 0, nota: 'pH bajo: usar pH Up (KOH) con la misma estrategia fraccionada.' };
    pasos.push('El pH está por debajo del rango. Agregar pH Up en dosis pequeñas (≈0.1 mL/L) y re-medir.');
    resultado.estado = 'corregir';
  }

  if (pasos.length === 0) pasos.push('Los parámetros están dentro del rango de la receta activa. No se requiere corrección.');
  return resultado;
}
