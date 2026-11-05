// backend/src/services/fcmService.js
import admin from 'firebase-admin';
import fs from 'node:fs';
import { query } from '../config/db.js';

let enabled = false;
try {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (path && fs.existsSync(path)) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(path, 'utf8'))) });
    enabled = true;
    console.log('[FCM] Inicializado');
  } else console.warn('[FCM] Sin cuenta de servicio; notificaciones push desactivadas');
} catch (err) { console.error('[FCM] Error al inicializar:', err.message); }

/** Envía una notificación crítica a todos los tokens registrados para un device_id. */
export async function sendCriticalPush(deviceId, { title, body, data = {} }) {
  if (!enabled) return { sent: 0 };
  try {
    const { rows } = await query('SELECT token FROM dispositivos_push WHERE device_id = $1', [deviceId]);
    if (!rows.length) return { sent: 0 };
    const tokens = rows.map((r) => r.token);
    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high', notification: { channelId: 'alertas_criticas', sound: 'default' } },
      apns: { payload: { aps: { sound: 'default', 'interruption-level': 'time-sensitive' } } },
    });
    // Limpieza de tokens inválidos
    const stale = tokens.filter((_, i) => res.responses[i].error?.code?.includes('registration-token-not-registered'));
    if (stale.length) await query('DELETE FROM dispositivos_push WHERE token = ANY($1)', [stale]);
    return { sent: res.successCount };
  } catch (err) {
    console.error('[FCM] Error al enviar:', err.message);
    return { sent: 0, error: err.message };
  }
}
