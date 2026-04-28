import { runQuery, getQuery, allQuery } from '../database.js';
import { calcularPontos } from '../utils/pontuacao.js';

// Obter todos os resultados
export async function getResultados(req, res) {
  try {
    const resultados = await allQuery(`
      SELECT 
        r.*,
        p.nome as piloto_nome,
        c.nome as corrida_nome
      FROM resultados r
      JOIN pilotos p ON r.piloto_id = p.id
      JOIN corridas c ON r.corrida_id = c.id
      ORDER BY c.data DESC, r.posicao ASC
    `);
    
    res.json(resultados);
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ erro: 'Erro ao buscar resultados' });
  }
}

// Adicionar resultado para uma corrida
export async function adicionarResultado(req, res) {
  try {
    const { corrida_id, piloto_id, posicao } = req.body;
    
    if (!corrida_id || !piloto_id || !posicao) {
      return res.status(400).json({ 
        erro: 'Corrida, piloto e posição são obrigatórios' 
      });
    }
    
    // Verificar se corrida e piloto existem
    const corrida = await getQuery('SELECT * FROM corridas WHERE id = ?', [corrida_id]);
    const piloto = await getQuery('SELECT * FROM pilotos WHERE id = ?', [piloto_id]);
    
    if (!corrida || !piloto) {
      return res.status(404).json({ erro: 'Corrida ou piloto não encontrado' });
    }
    
    // Verificar se piloto já tem resultado nesta corrida
    const resultadoExistente = await getQuery(
      'SELECT * FROM resultados WHERE corrida_id = ? AND piloto_id = ?',
      [corrida_id, piloto_id]
    );
    
    if (resultadoExistente) {
      return res.status(409).json({ 
        erro: 'Este piloto já tem um resultado registrado nesta corrida' 
      });
    }
    
    // Verificar se a posição já foi atribuída
    const posicaoUsada = await getQuery(
      'SELECT * FROM resultados WHERE corrida_id = ? AND posicao = ?',
      [corrida_id, posicao]
    );
    
    if (posicaoUsada) {
      return res.status(409).json({ 
        erro: 'Já existe um piloto com esta posição nesta corrida' 
      });
    }
    
    // Calcular pontos
    const pontos = calcularPontos(posicao);
    
    // Adicionar resultado
    const result = await runQuery(
      'INSERT INTO resultados (corrida_id, piloto_id, posicao, pontos) VALUES (?, ?, ?, ?)',
      [corrida_id, piloto_id, posicao, pontos]
    );
    
    const novoResultado = await getQuery(
      'SELECT * FROM resultados WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(novoResultado);
  } catch (error) {
    console.error('Erro ao adicionar resultado:', error);
    res.status(500).json({ erro: 'Erro ao adicionar resultado' });
  }
}

// Editar resultado
export async function editarResultado(req, res) {
  try {
    const { id } = req.params;
    const { posicao } = req.body;
    
    const resultado = await getQuery('SELECT * FROM resultados WHERE id = ?', [id]);
    
    if (!resultado) {
      return res.status(404).json({ erro: 'Resultado não encontrado' });
    }
    
    // Verificar se a nova posição já foi atribuída (excluindo o resultado atual)
    const posicaoUsada = await getQuery(
      'SELECT * FROM resultados WHERE corrida_id = ? AND posicao = ? AND id != ?',
      [resultado.corrida_id, posicao, id]
    );
    
    if (posicaoUsada) {
      return res.status(409).json({ 
        erro: 'Já existe um piloto com esta posição nesta corrida' 
      });
    }
    
    // Calcular novos pontos
    const novonPontos = calcularPontos(posicao);
    
    await runQuery(
      'UPDATE resultados SET posicao = ?, pontos = ? WHERE id = ?',
      [posicao, novonPontos, id]
    );
    
    const resultadoAtualizado = await getQuery(
      'SELECT * FROM resultados WHERE id = ?',
      [id]
    );
    
    res.json(resultadoAtualizado);
  } catch (error) {
    console.error('Erro ao editar resultado:', error);
    res.status(500).json({ erro: 'Erro ao editar resultado' });
  }
}

// Deletar resultado
export async function deletarResultado(req, res) {
  try {
    const { id } = req.params;
    
    const resultado = await getQuery('SELECT * FROM resultados WHERE id = ?', [id]);
    
    if (!resultado) {
      return res.status(404).json({ erro: 'Resultado não encontrado' });
    }
    
    await runQuery('DELETE FROM resultados WHERE id = ?', [id]);
    
    res.json({ mensagem: 'Resultado deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar resultado:', error);
    res.status(500).json({ erro: 'Erro ao deletar resultado' });
  }
}

// Obter ranking geral
export async function getRankingGeral(req, res) {
  try {
    const ranking = await allQuery(`
      SELECT 
        p.id,
        p.nome,
        COALESCE(SUM(r.pontos), 0) as pontos,
        COUNT(r.id) as corridas_participadas,
        COUNT(CASE WHEN r.posicao = 1 THEN 1 END) as vitoria,
        COUNT(CASE WHEN r.posicao = 2 THEN 1 END) as segundo,
        COUNT(CASE WHEN r.posicao = 3 THEN 1 END) as terceiro,
        MIN(r.posicao) as melhor_resultado
      FROM pilotos p
      LEFT JOIN resultados r ON p.id = r.piloto_id
      GROUP BY p.id, p.nome
      ORDER BY pontos DESC, vitoria DESC, segundo DESC, terceiro DESC, p.nome ASC
    `);
    
    // Adicionar ranking (posição)
    const rankingComPosicao = ranking.map((piloto, index) => ({
      ...piloto,
      posicao: index + 1
    }));
    
    res.json(rankingComPosicao);
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    res.status(500).json({ erro: 'Erro ao obter ranking' });
  }
}

// Obter histórico completo de corridas
export async function getHistoricoCorridas(req, res) {
  try {
    const historico = await allQuery(`
      SELECT 
        c.id,
        c.nome,
        c.data,
        c.categoria,
        COUNT(r.id) as total_pilotos
      FROM corridas c
      LEFT JOIN resultados r ON c.id = r.corrida_id
      GROUP BY c.id
      ORDER BY c.data DESC
    `);
    
    res.json(historico);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ erro: 'Erro ao obter histórico' });
  }
}
