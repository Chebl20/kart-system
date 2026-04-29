import { getDb, parseObjectId } from '../database.js';
import { calcularPontos } from '../utils/pontuacao.js';

function toCorridaId(body) {
  const raw = body.corrida_id;
  if (raw == null) return null;
  return parseObjectId(String(raw));
}

function toPilotoId(body) {
  const raw = body.piloto_id;
  if (raw == null) return null;
  return parseObjectId(String(raw));
}

// Obter todos os resultados
export async function getResultados(req, res) {
  try {
    const rows = await getDb()
      .collection('resultados')
      .aggregate([
        {
          $lookup: {
            from: 'pilotos',
            localField: 'piloto_id',
            foreignField: '_id',
            as: 'p'
          }
        },
        { $unwind: '$p' },
        {
          $lookup: {
            from: 'corridas',
            localField: 'corrida_id',
            foreignField: '_id',
            as: 'c'
          }
        },
        { $unwind: '$c' },
        {
          $project: {
            _id: 1,
            corrida_id: 1,
            piloto_id: 1,
            posicao: 1,
            pontos: 1,
            criado_em: 1,
            piloto_nome: '$p.nome',
            corrida_nome: '$c.nome'
          }
        },
        { $sort: { 'c.data': -1, posicao: 1 } }
      ])
      .toArray();

    const resultados = rows.map((r) => ({
      id: r._id.toString(),
      corrida_id: r.corrida_id.toString(),
      piloto_id: r.piloto_id.toString(),
      posicao: r.posicao,
      pontos: r.pontos,
      criado_em: r.criado_em,
      piloto_nome: r.piloto_nome,
      corrida_nome: r.corrida_nome
    }));

    res.json(resultados);
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ erro: 'Erro ao buscar resultados' });
  }
}

// Adicionar resultado para uma corrida
export async function adicionarResultado(req, res) {
  try {
    const { posicao } = req.body;
    const corrida_id = toCorridaId(req.body);
    const piloto_id = toPilotoId(req.body);

    if (!corrida_id || !piloto_id || posicao == null) {
      return res.status(400).json({
        erro: 'Corrida, piloto e posição são obrigatórios'
      });
    }

    const posicaoNum = Number(posicao);
    if (!Number.isInteger(posicaoNum) || posicaoNum < 1) {
      return res.status(400).json({ erro: 'Posição inválida' });
    }

    const corrida = await getDb().collection('corridas').findOne({ _id: corrida_id });
    const piloto = await getDb().collection('pilotos').findOne({ _id: piloto_id });

    if (!corrida || !piloto) {
      return res.status(404).json({ erro: 'Corrida ou piloto não encontrado' });
    }

    const resultadoExistente = await getDb().collection('resultados').findOne({
      corrida_id,
      piloto_id
    });

    if (resultadoExistente) {
      return res.status(409).json({
        erro: 'Este piloto já tem um resultado registrado nesta corrida'
      });
    }

    const posicaoUsada = await getDb().collection('resultados').findOne({
      corrida_id,
      posicao: posicaoNum
    });

    if (posicaoUsada) {
      return res.status(409).json({
        erro: 'Já existe um piloto com esta posição nesta corrida'
      });
    }

    const pontos = calcularPontos(posicaoNum);
    const criado_em = new Date();

    const { insertedId } = await getDb().collection('resultados').insertOne({
      corrida_id,
      piloto_id,
      posicao: posicaoNum,
      pontos,
      criado_em
    });

    const novo = await getDb().collection('resultados').findOne({ _id: insertedId });
    res.status(201).json({
      id: novo._id.toString(),
      corrida_id: novo.corrida_id.toString(),
      piloto_id: novo.piloto_id.toString(),
      posicao: novo.posicao,
      pontos: novo.pontos,
      criado_em: novo.criado_em
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        erro: 'Conflito: posição ou piloto já registrado nesta corrida'
      });
    }
    console.error('Erro ao adicionar resultado:', error);
    res.status(500).json({ erro: 'Erro ao adicionar resultado' });
  }
}

// Editar resultado
export async function editarResultado(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const { posicao } = req.body;
    const resultado = await getDb().collection('resultados').findOne({ _id: oid });
    if (!resultado) {
      return res.status(404).json({ erro: 'Resultado não encontrado' });
    }

    const posicaoNum = Number(posicao);
    if (!Number.isInteger(posicaoNum) || posicaoNum < 1) {
      return res.status(400).json({ erro: 'Posição inválida' });
    }

    const posicaoUsada = await getDb().collection('resultados').findOne({
      corrida_id: resultado.corrida_id,
      posicao: posicaoNum,
      _id: { $ne: oid }
    });

    if (posicaoUsada) {
      return res.status(409).json({
        erro: 'Já existe um piloto com esta posição nesta corrida'
      });
    }

    const novonPontos = calcularPontos(posicaoNum);
    await getDb().collection('resultados').updateOne(
      { _id: oid },
      { $set: { posicao: posicaoNum, pontos: novonPontos } }
    );

    const atualizado = await getDb().collection('resultados').findOne({ _id: oid });
    res.json({
      id: atualizado._id.toString(),
      corrida_id: atualizado.corrida_id.toString(),
      piloto_id: atualizado.piloto_id.toString(),
      posicao: atualizado.posicao,
      pontos: atualizado.pontos,
      criado_em: atualizado.criado_em
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        erro: 'Já existe um piloto com esta posição nesta corrida'
      });
    }
    console.error('Erro ao editar resultado:', error);
    res.status(500).json({ erro: 'Erro ao editar resultado' });
  }
}

// Deletar resultado
export async function deletarResultado(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const resultado = await getDb().collection('resultados').findOne({ _id: oid });
    if (!resultado) {
      return res.status(404).json({ erro: 'Resultado não encontrado' });
    }

    await getDb().collection('resultados').deleteOne({ _id: oid });
    res.json({ mensagem: 'Resultado deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar resultado:', error);
    res.status(500).json({ erro: 'Erro ao deletar resultado' });
  }
}

// Obter ranking geral
export async function getRankingGeral(req, res) {
  try {
    const ranking = await getDb()
      .collection('pilotos')
      .aggregate([
        {
          $lookup: {
            from: 'resultados',
            localField: '_id',
            foreignField: 'piloto_id',
            as: 'r'
          }
        },
        {
          $addFields: {
            pontos: { $ifNull: [{ $sum: '$r.pontos' }, 0] },
            corridas_participadas: { $size: '$r' },
            vitoria: {
              $size: {
                $filter: {
                  input: '$r',
                  as: 'x',
                  cond: { $eq: ['$$x.posicao', 1] }
                }
              }
            },
            segundo: {
              $size: {
                $filter: {
                  input: '$r',
                  as: 'x',
                  cond: { $eq: ['$$x.posicao', 2] }
                }
              }
            },
            terceiro: {
              $size: {
                $filter: {
                  input: '$r',
                  as: 'x',
                  cond: { $eq: ['$$x.posicao', 3] }
                }
              }
            },
            melhor_resultado: {
              $min: '$r.posicao'
            }
          }
        },
        { $project: { r: 0 } },
        {
          $sort: {
            pontos: -1,
            vitoria: -1,
            segundo: -1,
            terceiro: -1,
            nome: 1
          }
        }
      ])
      .toArray();

    const rankingComPosicao = ranking.map((piloto, index) => ({
      id: piloto._id.toString(),
      nome: piloto.nome,
      pontos: piloto.pontos,
      corridas_participadas: piloto.corridas_participadas,
      vitoria: piloto.vitoria,
      segundo: piloto.segundo,
      terceiro: piloto.terceiro,
      melhor_resultado: piloto.melhor_resultado ?? null,
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
    const historico = await getDb()
      .collection('corridas')
      .aggregate([
        {
          $lookup: {
            from: 'resultados',
            localField: '_id',
            foreignField: 'corrida_id',
            as: 'r'
          }
        },
        {
          $project: {
            id: '$_id',
            nome: 1,
            data: 1,
            categoria: 1,
            total_pilotos: { $size: '$r' }
          }
        },
        { $sort: { data: -1 } }
      ])
      .toArray();

    const out = historico.map((h) => ({
      id: h.id.toString(),
      nome: h.nome,
      data: h.data,
      categoria: h.categoria,
      total_pilotos: h.total_pilotos
    }));

    res.json(out);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ erro: 'Erro ao obter histórico' });
  }
}
