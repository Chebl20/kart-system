import express from 'express';
import {
  getPilotos,
  getPilotoById,
  criarPiloto,
  deletarPiloto
} from '../controllers/pilotosController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas de pilotos
router.get('/', getPilotos);              // GET /api/pilotos
router.get('/:id', getPilotoById);        // GET /api/pilotos/:id
router.post('/', requireAdmin, criarPiloto);            // POST /api/pilotos
router.delete('/:id', requireAdmin, deletarPiloto);     // DELETE /api/pilotos/:id

export default router;
