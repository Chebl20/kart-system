import express from 'express';
import {
  getCorridas,
  getCorridaById,
  criarCorrida,
  deletarCorrida,
  editarCorrida
} from '../controllers/corridasController.js';

const router = express.Router();

// Rotas de corridas
router.get('/', getCorridas);             // GET /api/corridas
router.get('/:id', getCorridaById);       // GET /api/corridas/:id
router.post('/', criarCorrida);           // POST /api/corridas
router.put('/:id', editarCorrida);        // PUT /api/corridas/:id
router.delete('/:id', deletarCorrida);    // DELETE /api/corridas/:id

export default router;
