// backend/src/routes/index.js
import { Router } from 'express';
import * as L from '../controllers/lecturaController.js';
import * as R from '../controllers/recetaController.js';
import * as A from '../controllers/alertaController.js';
import * as D from '../controllers/dosingController.js';

const r = Router();
r.get('/health', (_q, s) => s.json({ ok: true, ts: new Date().toISOString() }));

r.post('/lecturas', L.crear);
r.get('/lecturas/ultima', L.ultima);
r.get('/lecturas/historico', L.historico);

r.get('/recetas', R.listar);
r.post('/recetas', R.crear);
r.put('/recetas/:id', R.actualizar);
r.delete('/recetas/:id', R.eliminar);
r.post('/recetas/activar', R.activar);
r.get('/recetas/activa', R.getActiva);

r.get('/alertas', A.listar);
r.patch('/alertas/:id/leida', A.marcarLeida);
r.post('/push/token', A.registrarToken);

r.post('/dosificacion', D.calcular);
export default r;
