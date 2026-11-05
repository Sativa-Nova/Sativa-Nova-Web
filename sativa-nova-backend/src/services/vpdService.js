// backend/src/services/vpdService.js
/**
 * Presión de vapor de saturación (kPa) según Buck (1981), válida para T > 0 °C.
 */
export function saturationVaporPressure(tempC) {
  return 0.61121 * Math.exp((18.678 - tempC / 234.5) * (tempC / (257.14 + tempC)));
}

/**
 * VPD en kPa. `leafOffset` modela que la hoja suele estar 1-2 °C por debajo del aire.
 */
export function calcVPD(tempAirC, rhPercent, leafOffset = 0) {
  const esAir = saturationVaporPressure(tempAirC);
  const esLeaf = saturationVaporPressure(tempAirC - leafOffset);
  const ea = esAir * (rhPercent / 100);
  return Math.max(0, +(esLeaf - ea).toFixed(3));
}

export function vpdZone(vpd) {
  if (vpd >= 0.4 && vpd < 0.8) return 'Germinación';
  if (vpd >= 0.8 && vpd < 1.2) return 'Vegetativo';
  if (vpd >= 1.2 && vpd <= 1.6) return 'Floración';
  return 'Zona Peligrosa';
}
