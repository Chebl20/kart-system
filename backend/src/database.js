import sqlite3 from 'sqlite3';
import path from 'path';

const DATABASE_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), 'kart.db');

// Abre a conexão com o banco de dados
export const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

// Inicializa o banco de dados com as tabelas necessárias
export function initializeDatabase() {
  db.serialize(() => {
    // Tabela de Pilotos
    db.run(`
      CREATE TABLE IF NOT EXISTS pilotos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        pontos INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela pilotos:', err);
      else console.log('✓ Tabela pilotos criada/verificada');
    });

    // Tabela de Corridas
    db.run(`
      CREATE TABLE IF NOT EXISTS corridas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        data DATE NOT NULL,
        categoria TEXT NOT NULL,
        criada_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela corridas:', err);
      else console.log('✓ Tabela corridas criada/verificada');
    });

    // Tabela de Resultados
    db.run(`
      CREATE TABLE IF NOT EXISTS resultados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        corrida_id INTEGER NOT NULL,
        piloto_id INTEGER NOT NULL,
        posicao INTEGER NOT NULL,
        pontos INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (corrida_id) REFERENCES corridas(id) ON DELETE CASCADE,
        FOREIGN KEY (piloto_id) REFERENCES pilotos(id) ON DELETE CASCADE,
        UNIQUE(corrida_id, piloto_id),
        UNIQUE(corrida_id, posicao)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela resultados:', err);
      else console.log('✓ Tabela resultados criada/verificada');
    });
  });
}

// Wrapper para promessas com o banco de dados
export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
