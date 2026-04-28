import React, { useState, useEffect } from 'react';
import { getHistoricoCorridas, getCorridaById } from '../services/api';
import { Card } from '../components/Layout';
import '../styles/pages.css';

export const HistoricoPage = () => {
  const [corridas, setCorridas] = useState([]);
  const [corridaSelecionada, setCorridaSelecionada] = useState(null);
  const [resultadosCorrida, setResultadosCorrida] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const response = await getHistoricoCorridas();
      setCorridas(response.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar histórico');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCorrida = async (corrida) => {
    try {
      const response = await getCorridaById(corrida.id);
      setCorridaSelecionada(corrida);
      setResultadosCorrida(response.data.resultados || []);
    } catch (err) {
      setError('Erro ao carregar resultados da corrida');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Histórico de Corridas</h2>
          <p>Resultados de Eventos Realizados</p>
        </div>
        <div className="stats">
          <div className="stat-box">
            <span className="stat-label">Total de Eventos</span>
            <span className="stat-value">{corridas.length}</span>
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading">Carregando histórico...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : corridas.length === 0 ? (
          <div className="empty-state">Nenhuma corrida no histórico</div>
        ) : (
          <div className="historico-container">
            {/* Lista de Corridas */}
            <Card className="historico-list">
              <h3>Corridas Realizadas</h3>
              <div className="corridas-list">
                {corridas.map((corrida) => (
                  <div
                    key={corrida.id}
                    className={`corrida-item ${
                      corridaSelecionada?.id === corrida.id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectCorrida(corrida)}
                  >
                    <div className="corrida-date">
                      {new Date(corrida.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="corrida-info">
                      <div className="corrida-name">{corrida.nome}</div>
                      <div className="corrida-category">{corrida.categoria}</div>
                    </div>
                    <div className="corrida-pilots">
                      {corrida.total_pilotos} pilotos
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Detalhes da Corrida */}
            {corridaSelecionada && (
              <Card className="historico-details">
                <h3>{corridaSelecionada.nome}</h3>
                <div className="corrida-header">
                  <div>
                    <p className="label">Data:</p>
                    <p className="value">
                      {new Date(corridaSelecionada.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="label">Categoria:</p>
                    <p className="value">{corridaSelecionada.categoria}</p>
                  </div>
                  <div>
                    <p className="label">Pilotos:</p>
                    <p className="value">{resultadosCorrida.length}</p>
                  </div>
                </div>

                {resultadosCorrida.length === 0 ? (
                  <div className="empty-state">Nenhum resultado para esta corrida</div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Posição</th>
                          <th>Piloto</th>
                          <th>Pontos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadosCorrida.map((resultado) => (
                          <tr key={resultado.id} className={`pos-${resultado.posicao}`}>
                            <td className="posicao">
                              <span className="badge">{resultado.posicao}º</span>
                            </td>
                            <td className="piloto">{resultado.piloto_nome}</td>
                            <td className="pontos"><strong>+{resultado.pontos}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
