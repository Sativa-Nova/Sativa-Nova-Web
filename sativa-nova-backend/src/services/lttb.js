// backend/src/services/lttb.js
/**
 * Largest-Triangle-Three-Buckets (Steinarsson, 2013).
 * Reduce una serie [{x:number, y:number, ...}] a `threshold` puntos
 * preservando la forma visual. Conserva siempre el primer y último punto.
 */
export function lttb(data, threshold) {
  const n = data.length;
  if (threshold >= n || threshold <= 2) return data;

  const sampled = [data[0]];
  const bucketSize = (n - 2) / (threshold - 2);
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    // Promedio del siguiente bucket (punto C)
    const nextStart = Math.floor((i + 1) * bucketSize) + 1;
    const nextEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
    let avgX = 0, avgY = 0;
    for (let j = nextStart; j < nextEnd; j++) { avgX += data[j].x; avgY += data[j].y; }
    const len = nextEnd - nextStart || 1;
    avgX /= len; avgY /= len;

    // Bucket actual: elegir el punto que forma el triángulo de mayor área con A y C
    const curStart = Math.floor(i * bucketSize) + 1;
    const curEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, n);
    const ax = data[a].x, ay = data[a].y;
    let maxArea = -1, maxIdx = curStart;
    for (let j = curStart; j < curEnd; j++) {
      const area = Math.abs((ax - avgX) * (data[j].y - ay) - (ax - data[j].x) * (avgY - ay)) * 0.5;
      if (area > maxArea) { maxArea = area; maxIdx = j; }
    }
    sampled.push(data[maxIdx]);
    a = maxIdx;
  }
  sampled.push(data[n - 1]);
  return sampled;
}

/**
 * Aplica LTTB a una lista de lecturas por cada variable, devolviendo
 * un mapa { variable: [{x: epochMs, y}] }.
 */
export function downsampleLecturas(rows, threshold, variables) {
  const out = {};
  for (const v of variables) {
    const serie = rows
      .filter((r) => r[v] !== null && r[v] !== undefined)
      .map((r) => ({ x: new Date(r.fecha).getTime(), y: Number(r[v]) }));
    out[v] = lttb(serie, threshold);
  }
  return out;
}
