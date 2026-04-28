import { runQuery, getQuery, allQuery } from '../database.js';

// Obter todos os pilotos com seus pontos totais
export async function getPilotos(req, res) {
  try {
    const pilotos = await allQuery(`
      SELECT 
        p.id,
        p.nome,
        COALESCE(SUM(r.pontos), 0) as pontos,
        COUNT(r.id) as corridas_participadas,
        MAX(r.posicao) as melhor_resultado
      FROM pilotos p
      LEFT JOIN resultados r ON p.id = r.piloto_id
      GROUP BY p.id, p.nome
      ORDER BY pontos DESC, nome ASC
    `);
    
    res.json(pilotos);
  } catch (error) {
    console.error('Erro ao buscar pilotos:', error);
    res.status(500).json({ erro: 'Erro ao buscar pilotos' });
  }
}

// Obter piloto específico por ID
export async function getPilotoById(req, res) {
  try {
    const { id } = req.params;
    const piloto = await getQuery(`
      SELECT 
        p.id,
        p.nome,
        COALESCE(SUM(r.pontos), 0) as pontos,
        COUNT(r.id) as corridas_participadas
      FROM pilotos p
      LEFT JOIN resultados r ON p.id = r.piloto_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    
    if (!piloto) {
      return res.status(404).json({ erro: 'Piloto não encontrado' });
    }
    
    // Obter histórico de resultados do piloto
    const historico = await allQuery(`
      SELECT 
        c.id,
        c.nome as corrida_nome,
        c.data,
        c.categoria,
        r.posicao,
        r.pontos
      FROM resultados r
      JOIN corridas c ON r.corrida_id = c.id
      WHERE r.piloto_id = ?
      ORDER BY c.data DESC
    `, [id]);
    
    res.json({ ...piloto, historico });
  } catch (error) {
    console.error('Erro ao buscar piloto:', error);
    res.status(500).json({ erro: 'Erro ao buscar piloto' });
  }
}

// Criar novo piloto
export async function criarPiloto(req, res) {
  try {
    const { nome } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'Nome do piloto é obrigatório' });
    }
    
    // Verificar se piloto já existe
    const pilotoExistente = await getQuery(
      'SELECT id FROM pilotos WHERE nome = ?',
      [nome]
    );
    
    if (pilotoExistente) {
      return res.status(409).json({ erro: 'Piloto já existe no sistema' });
    }
    
    const result = await runQuery(
      'INSERT INTO pilotos (nome) VALUES (?)',
      [nome]
    );
    
    const novoPiloto = await getQuery(
      'SELECT * FROM pilotos WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(novoPiloto);
  } catch (error) {
    console.error('Erro ao criar piloto:', error);
    res.status(500).json({ erro: 'Erro ao criar piloto' });
  }
}

// Deletar piloto
export async function deletarPiloto(req, res) {
  try {
    const { id } = req.params;
    
    const piloto = await getQuery('SELECT * FROM pilotos WHERE id = ?', [id]);
    
    if (!piloto) {
      return res.status(404).json({ erro: 'Piloto não encontrado' });
    }
    
    await runQuery('DELETE FROM pilotos WHERE id = ?', [id]);
    
    res.json({ mensagem: 'Piloto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar piloto:', error);
    res.status(500).json({ erro: 'Erro ao deletar piloto' });
  }
}
