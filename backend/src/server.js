import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDb } from './database.js';
import authRoutes from './routes/auth.js';
import pilotosRoutes from './routes/pilotos.js';
import corridasRoutes from './routes/corridas.js';
import resultadosRoutes from './routes/resultados.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API está funcionando' });
});

// Autenticação (login público)
app.use('/api/auth', authRoutes);

// Rotas da API
app.use('/api/pilotos', pilotosRoutes);
app.use('/api/corridas', corridasRoutes);
app.use('/api/resultados', resultadosRoutes);

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

connectDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🏎️  SERVIDOR KART SYSTEM INICIADO`);
      console.log(`✓ Porta: ${PORT}`);
      console.log(`✓ Acesse em: http://localhost:${PORT}`);
      console.log(`✓ API: http://localhost:${PORT}/api\n`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });
