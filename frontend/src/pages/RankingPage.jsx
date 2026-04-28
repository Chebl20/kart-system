import React, { useState, useEffect } from 'react';
import { getRankingGeral } from '../services/api';
import { Card } from '../components/Layout';
import '../styles/pages.css';

export const RankingPage = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarRanking();
  }, []);

  const carregarRanking = async () => {
    try {
      setLoading(true);
      const response = await getRankingGeral();
      setRanking(response.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar ranking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPodiumClass = (posicao) => {
    if (posicao === 1) return 'podium-first';
    if (posicao === 2) return 'podium-second';
    if (posicao === 3) return 'podium-third';
    return '';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Ranking Geral</h2>
          <p>Classificação do Campeonato 2024</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando ranking...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : ranking.length === 0 ? (
        <div className="empty-state">Nenhum resultado registrado ainda</div>
      ) : (
        <>
          {/* Pódio */}
          {ranking.length >= 3 && (
            <div className="podium-container">
              {ranking.slice(0, 3).map((piloto, index) => (
                <Card key={piloto.id} className={`podium-card ${getPodiumClass(index + 1)}`}>
                  <div className="podium-position">{index + 1}º</div>
                  <div className="podium-name">{piloto.nome}</div>
                  <div className="podium-points">{piloto.pontos} PTS</div>
                </Card>
              ))}
            </div>
          )}

          {/* Tabela de Ranking */}
          <Card className="ranking-table-card">
            <h3>Classificação Completa</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Piloto</th>
                    <th>Pontos</th>
                    <th>Corridas</th>
                    <th>Vitórias</th>
                    <th>2º Lugar</th>
                    <th>3º Lugar</th>
                    <th>Melhor</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((piloto) => (
                    <tr key={piloto.id} className={getPodiumClass(piloto.posicao)}>
                      <td className="rank-position">
                        <strong>{piloto.posicao}º</strong>
                      </td>
                      <td className="pilot-name">{piloto.nome}</td>
                      <td className="points"><strong>{piloto.pontos}</strong></td>
                      <td>{piloto.corridas_participadas || 0}</td>
                      <td className="stat">{piloto.vitoria || 0}</td>
                      <td className="stat">{piloto.segundo || 0}</td>
                      <td className="stat">{piloto.terceiro || 0}</td>
                      <td className="best">{piloto.melhor_resultado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
