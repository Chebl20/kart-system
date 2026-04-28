import express from 'express';
import {
  getResultados,
  adicionarResultado,
  editarResultado,
  deletarResultado,
  getRankingGeral,
  getHistoricoCorridas
} from '../controllers/resultadosController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas especiais (antes de rotas genéricas com :id)
router.get('/ranking/geral', getRankingGeral);    // GET /api/resultados/ranking/geral
router.get('/historico/corridas', getHistoricoCorridas); // GET /api/resultados/historico/corridas

// Rotas de resultados
router.get('/', getResultados);                   // GET /api/resultados
router.post('/', requireAdmin, adicionarResultado);             // POST /api/resultados
router.put('/:id', requireAdmin, editarResultado);              // PUT /api/resultados/:id
router.delete('/:id', requireAdmin, deletarResultado);          // DELETE /api/resultados/:id

export default router;
