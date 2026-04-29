import { getDb, parseObjectId } from '../database.js';

function serializeCorrida(doc, total_pilotos) {
  return {
    id: doc._id.toString(),
    nome: doc.nome,
    data: doc.data,
    categoria: doc.categoria,
    criada_em: doc.criada_em,
    total_pilotos
  };
}

// Obter todas as corridas
export async function getCorridas(req, res) {
  try {
    const rows = await getDb()
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
          $addFields: {
            total_pilotos: { $size: '$r' }
          }
        },
        { $project: { r: 0 } },
        { $sort: { data: -1 } }
      ])
      .toArray();

    const corridas = rows.map((c) =>
      serializeCorrida(c, c.total_pilotos)
    );
    res.json(corridas);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({ erro: 'Erro ao buscar corridas' });
  }
}

// Obter corrida específica com seus resultados
export async function getCorridaById(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const corrida = await getDb().collection('corridas').findOne({ _id: oid });
    if (!corrida) {
      return res.status(404).json({ erro: 'Corrida não encontrada' });
    }

    const resultadosRaw = await getDb()
      .collection('resultados')
      .aggregate([
        { $match: { corrida_id: oid } },
        {
          $lookup: {
            from: 'pilotos',
            localField: 'piloto_id',
            foreignField: '_id',
            as: 'p'
          }
        },
        { $unwind: '$p' },
        { $sort: { posicao: 1 } },
        {
          $project: {
            _id: 1,
            corrida_id: 1,
            piloto_id: 1,
            posicao: 1,
            pontos: 1,
            criado_em: 1,
            piloto_nome: '$p.nome'
          }
        }
      ])
      .toArray();

    const resultados = resultadosRaw.map((r) => ({
      id: r._id.toString(),
      corrida_id: r.corrida_id.toString(),
      piloto_id: r.piloto_id.toString(),
      posicao: r.posicao,
      pontos: r.pontos,
      criado_em: r.criado_em,
      piloto_nome: r.piloto_nome
    }));

    res.json({
      id: corrida._id.toString(),
      nome: corrida.nome,
      data: corrida.data,
      categoria: corrida.categoria,
      criada_em: corrida.criada_em,
      resultados
    });
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

    // Converter data para UTC para evitar problemas de fuso horário
    const dataUTC = new Date(data + 'T00:00:00.000Z');
    const criada_em = new Date();
    const { insertedId } = await getDb().collection('corridas').insertOne({
      nome,
      data: dataUTC,
      categoria,
      criada_em
    });

    const nova = await getDb().collection('corridas').findOne({ _id: insertedId });
    res.status(201).json(serializeCorrida(nova, 0));
  } catch (error) {
    console.error('Erro ao criar corrida:', error);
    res.status(500).json({ erro: 'Erro ao criar corrida' });
  }
}

// Deletar corrida
export async function deletarCorrida(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const corrida = await getDb().collection('corridas').findOne({ _id: oid });
    if (!corrida) {
      return res.status(404).json({ erro: 'Corrida não encontrada' });
    }

    await getDb().collection('resultados').deleteMany({ corrida_id: oid });
    await getDb().collection('corridas').deleteOne({ _id: oid });

    res.json({ mensagem: 'Corrida deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar corrida:', error);
    res.status(500).json({ erro: 'Erro ao deletar corrida' });
  }
}

// Editar corrida
export async function editarCorrida(req, res) {
  try {
    const oid = parseObjectId(req.params.id);
    if (!oid) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const { nome, data, categoria } = req.body;
    const corrida = await getDb().collection('corridas').findOne({ _id: oid });
    if (!corrida) {
      return res.status(404).json({ erro: 'Corrida não encontrada' });
    }

    // Converter data para UTC para evitar problemas de fuso horário
    const dataUTC = new Date(data + 'T00:00:00.000Z');
    await getDb().collection('corridas').updateOne(
      { _id: oid },
      { $set: { nome, data: dataUTC, categoria } }
    );

    const atualizada = await getDb().collection('corridas').findOne({ _id: oid });
    const total = await getDb().collection('resultados').countDocuments({ corrida_id: oid });
    res.json(serializeCorrida(atualizada, total));
  } catch (error) {
    console.error('Erro ao editar corrida:', error);
    res.status(500).json({ erro: 'Erro ao editar corrida' });
  }
}
