import express from 'express';
import {
  getCorridas,
  getCorridaById,
  criarCorrida,
  deletarCorrida,
  editarCorrida
} from '../controllers/corridasController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas de corridas
router.get('/', getCorridas);             // GET /api/corridas
router.get('/:id', getCorridaById);       // GET /api/corridas/:id
router.post('/', requireAdmin, criarCorrida);           // POST /api/corridas
router.put('/:id', requireAdmin, editarCorrida);        // PUT /api/corridas/:id
router.delete('/:id', requireAdmin, deletarCorrida);    // DELETE /api/corridas/:id

export default router;
