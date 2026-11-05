// backend/src/server.js
import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import routes from './routers/index.js';
import { pool } from './config/db.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', routes);

// Manejador de errores centralizado
app.use((err, _req, res, _next) => {
  console.error('[HTTP]', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, pingInterval: 20_000, pingTimeout: 25_000 });
app.set('io', io);

io.on('connection', (socket) => {
  // La app se suscribe a la sala de su dispositivo
  socket.on('suscribir', (deviceId) => {
    if (typeof deviceId === 'string' && deviceId.length < 64) socket.join(`device:${deviceId}`);
  });
  socket.on('desuscribir', (deviceId) => socket.leave(`device:${deviceId}`));
});

const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Conexión a Neon establecida (SSL)');
    server.listen(PORT, () => console.log(`[HTTP] Sativa Nova API en http://localhost:${PORT}`));
  } catch (err) {
    console.error('[DB] No se pudo conectar:', err.message);
    process.exit(1);
  }
})();

const shutdown = async () => { console.log('Cerrando…'); io.close(); await pool.end(); process.exit(0); };
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
