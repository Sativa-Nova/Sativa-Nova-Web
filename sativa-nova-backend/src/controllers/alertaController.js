// backend/src/controllers/alertaController.js
import * as Alerta from '../models/alertaModel.js';
export const listar = async (req, res, next) => { try { res.json(await Alerta.listar(req.query.device_id)); } catch (e) { next(e); } };
export const marcarLeida = async (req, res, next) => { try { res.json(await Alerta.marcarLeida(Number(req.params.id))); } catch (e) { next(e); } };
export const registrarToken = async (req, res, next) => {
  try {
    const { token, device_id, plataforma } = req.body;
    if (!token || !device_id) return res.status(400).json({ error: 'token y device_id son obligatorios' });
    await Alerta.registrarToken(token, device_id, plataforma); res.status(204).end();
  } catch (e) { next(e); }
};
