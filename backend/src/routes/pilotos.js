import express from 'express';
import {
  getPilotos,
  getPilotoById,
  criarPiloto,
  deletarPiloto
} from '../controllers/pilotosController.js';

const router = express.Router();

// Rotas de pilotos
router.get('/', getPilotos);              // GET /api/pilotos
router.get('/:id', getPilotoById);        // GET /api/pilotos/:id
router.post('/', criarPiloto);            // POST /api/pilotos
router.delete('/:id', deletarPiloto);     // DELETE /api/pilotos/:id

export default router;
