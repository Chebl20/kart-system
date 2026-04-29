import { MongoClient, ObjectId } from 'mongodb';

const DEFAULT_DB_NAME = 'kart';

let client;
let db;

/**
 * Converte string de rota em ObjectId (24 hex). Retorna null se inválido.
 */
export function parseObjectId(id) {
  if (id == null || typeof id !== 'string') return null;
  if (!ObjectId.isValid(id)) return null;
  const oid = new ObjectId(id);
  if (oid.toString() !== id) return null;
  return oid;
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Defina MONGODB_URI (ex.: mongodb+srv://user:pass@host/kart?appName=...)'
    );
  }
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  const name = process.env.MONGODB_DB || DEFAULT_DB_NAME;
  db = client.db(name);
  await ensureIndexes(db);
  console.log('✓ Conectado ao MongoDB');
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Banco não inicializado — chame connectDb() antes do servidor.');
  }
  return db;
}

async function ensureIndexes(database) {
  await database.collection('pilotos').createIndex({ nome: 1 }, { unique: true });
  await database
    .collection('resultados')
    .createIndex({ corrida_id: 1, piloto_id: 1 }, { unique: true });
  await database
    .collection('resultados')
    .createIndex({ corrida_id: 1, posicao: 1 }, { unique: true });
}
