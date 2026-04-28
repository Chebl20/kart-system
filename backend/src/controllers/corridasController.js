import { runQuery, getQuery, allQuery } from '../database.js';

// Obter todas as corridas
export async function getCorridas(req, res) {
  try {
    const corridas = await allQuery(`
      SELECT 
        c.*,
        COUNT(r.id) as total_pilotos
      FROM corridas c
      LEFT JOIN resultados r ON c.id = r.corrida_id
      GROUP BY c.id
      ORDER BY c.data DESC
    `);
    
    res.json(corridas);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({ erro: 'Erro ao buscar corridas' });
  }
}

// Obter corrida específica com seus resultados
export async function getCorridaById(req, res) {
  try {
    const { id } = req.params;
    
    const corrida = await getQuery('SELECT * FROM corridas WHERE id = ?', [id]);
    
    if (!corrida) {
      return res.status(404).json({ erro: 'Corrida não encontrada' });
    }
    
    // Obter todos os resultados da corrida
    const resultados = await allQuery(`
      SELECT 
        r.*,
        p.nome as piloto_nome
      FROM resultados r
      JOIN pilotos p ON r.piloto_id = p.id
      WHERE r.corrida_id = ?
      ORDER BY r.posicao ASC
    `, [id]);
    
    res.json({ ...corrida, resultados });
  } catch (error) {
    console.error('Erro ao buscar corrida:', error);
    res.status(500).json({ erro: 'Erro ao buscar corrida' });
  }
}

// Criar nova corrida
export async function criarCorrida(req, res) {
  try {
    const { nome, data, categoria } = req.body;
    
    if (!nome || !data || !categoria) {
      return res.status(400).json({ 
        erro: 'Nome, data e categoria são obrigatórios' 
      });
    }
    
    const result = await runQuery(
      'INSERT INTO corridas (nome, data, categoria) VALUES (?, ?, ?)',
      [nome, data, categoria]
    );
    
    const novaCorrida = await getQuery(
      'SELECT * FROM corridas WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(novaCorrida);
  } catch (error) {
    console.error('Erro ao criar corrida:', error);
    res.status(500).json({ erro: 'Erro ao criar corrida' });
  }
}

// Deletar corrida
export async function deletarCorrida(req, res) {
  try {
    const { id } = req.params;
    
    const corrida = await getQuery('SELECT * FROM corridas WHERE id = ?', [id]);
    
    if (!corrida) {
      return res.status(404).json({ erro: 'Corrida não encontrada' });
    }
    
    // Os resultados serão deletados automaticamente por CASCADE
    await runQuery('DELETE FROM corridas WHERE id = ?', [id]);
    
    res.json({ mensagem: 'Corrida deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar corrida:', error);
    res.status(500).json({ erro: 'Erro ao deletar corrida' });
  }
}

// Editar corrida
export async function editarCorrida(req, res) {
  try {
    const { id } = req.params;
    const { nome, data, categoria } = req.body;
    
    const corrida = await getQuery('SELECT * FROM corridas WHERE id = ?', [id]);
    
    if (!corrida) {
      return res.status(404).json({ erro: 'Corrida não encontrada' });
    }
    
    await runQuery(
      'UPDATE corridas SET nome = ?, data = ?, categoria = ? WHERE id = ?',
      [nome, data, categoria, id]
    );
    
    const corridaAtualizada = await getQuery(
      'SELECT * FROM corridas WHERE id = ?',
      [id]
    );
    
    res.json(corridaAtualizada);
  } catch (error) {
    console.error('Erro ao editar corrida:', error);
    res.status(500).json({ erro: 'Erro ao editar corrida' });
  }
}
