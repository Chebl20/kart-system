import express from 'express';
import {
  getResultados,
  adicionarResultado,
  editarResultado,
  deletarResultado,
  getRankingGeral,
  getHistoricoCorridas
} from '../controllers/resultadosController.js';

const router = express.Router();

// Rotas de resultados
router.get('/', getResultados);                   // GET /api/resultados
router.post('/', adicionarResultado);             // POST /api/resultados
router.put('/:id', editarResultado);              // PUT /api/resultados/:id
router.delete('/:id', deletarResultado);          // DELETE /api/resultados/:id

// Rotas especiais
router.get('/ranking/geral', getRankingGeral);    // GET /api/resultados/ranking/geral
router.get('/historico/corridas', getHistoricoCorridas); // GET /api/resultados/historico/corridas

export default router;
