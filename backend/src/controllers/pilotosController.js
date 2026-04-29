import { getDb, parseObjectId } from '../database.js';

function serializePilotoBase(doc) {
  return {
    id: doc._id.toString(),
    nome: doc.nome,
    criado_em: doc.criado_em
  };
}

// Obter todos os pilotos com seus pontos totais
export async function getPilotos(req, res) {
  try {
    const rows = await getDb()
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
            melhor_resultado: { $max: '$r.posicao' }
          }
        },
        { $project: { r: 0 } },
        { $sort: { pontos: -1, nome: 1 } }
      ])
      .toArray();

    const pilotos = rows.map((p) => ({
      id: p._id.toString(),
      nome: p.nome,
      pontos: p.pontos,
      corridas_participadas: p.corridas_participadas,
      melhor_resultado: p.melhor_resultado ?? null
    }));

    res.json(pilotos);
  } catch (error) {
    console.error('Erro ao buscar pilotos:', error);
    res.status(500).json({ erro: 'Erro ao buscar pilotos' });
  }
}

// Obter piloto específico por ID
export async function getPilotoById(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const agg = await getDb()
      .collection('pilotos')
      .aggregate([
        { $match: { _id: oid } },
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
            corridas_participadas: { $size: '$r' }
          }
        },
        { $project: { r: 0 } },
        { $limit: 1 }
      ])
      .toArray();

    const p = agg[0];
    if (!p) {
      return res.status(404).json({ erro: 'Piloto não encontrado' });
    }
    const historico = await getDb()
      .collection('resultados')
      .aggregate([
        { $match: { piloto_id: oid } },
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
            id: '$c._id',
            corrida_nome: '$c.nome',
            data: '$c.data',
            categoria: '$c.categoria',
            posicao: 1,
            pontos: 1
          }
        },
        { $sort: { data: -1 } }
      ])
      .toArray();

    const historicoOut = historico.map((h) => ({
      id: h.id.toString(),
      corrida_nome: h.corrida_nome,
      data: h.data,
      categoria: h.categoria,
      posicao: h.posicao,
      pontos: h.pontos
    }));

    res.json({
      id: p._id.toString(),
      nome: p.nome,
      pontos: p.pontos,
      corridas_participadas: p.corridas_participadas,
      criado_em: p.criado_em,
      historico: historicoOut
    });
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

    const criado_em = new Date();
    const { insertedId } = await getDb().collection('pilotos').insertOne({
      nome: nome.trim(),
      criado_em
    });

    res.status(201).json(serializePilotoBase({ _id: insertedId, nome: nome.trim(), criado_em }));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ erro: 'Piloto já existe no sistema' });
    }
    console.error('Erro ao criar piloto:', error);
    res.status(500).json({ erro: 'Erro ao criar piloto' });
  }
}

// Deletar piloto
export async function deletarPiloto(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const piloto = await getDb().collection('pilotos').findOne({ _id: oid });
    if (!piloto) {
      return res.status(404).json({ erro: 'Piloto não encontrado' });
    }

    await getDb().collection('resultados').deleteMany({ piloto_id: oid });
    await getDb().collection('pilotos').deleteOne({ _id: oid });

    res.json({ mensagem: 'Piloto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar piloto:', error);
    res.status(500).json({ erro: 'Erro ao deletar piloto' });
  }
}
