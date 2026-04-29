import React, { useState, useEffect } from 'react';
import {
  getCorridas,
  getPilotos,
  adicionarResultado,
  deletarResultado,
  getCorridaById
} from '../services/api';
import { Card, Button, Input, Select } from '../components/Layout';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/pages.css';

export const ResultadosPage = () => {
  const { isAdmin } = useAuth();
  const [corridas, setCorridas] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [corridaSelecionada, setCorridaSelecionada] = useState('');
  const [resultados, setResultados] = useState([]);
  const [resultadosRapido, setResultadosRapido] = useState({}); // { piloto_id: posicao }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modo, setModo] = useState('rapido'); // 'rapido' ou 'individual'

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (corridaSelecionada) {
      carregarResultadosCorrida(corridaSelecionada);
      setResultadosRapido({});
    }
  }, [corridaSelecionada]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [corridasRes, pilotosRes] = await Promise.all([
        getCorridas(),
        getPilotos()
      ]);
      setCorridas(corridasRes.data);
      setPilotos(pilotosRes.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const carregarResultadosCorrida = async (id) => {
    try {
      const response = await getCorridaById(id);
      setResultados(response.data.resultados || []);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar resultados');
    }
  };

  // Modo Rápido: Adicionar múltiplos de uma vez
  const handleAdicionarResultadosRapido = async (e) => {
    e.preventDefault();
    
    const resultadosParaAdicionar = Object.entries(resultadosRapido).map(([piloto_id, posicao]) => ({
      piloto_id: String(piloto_id),
      posicao: parseInt(posicao, 10)
    })).filter((r) => Number.isFinite(r.posicao) && r.posicao >= 1);

    if (resultadosParaAdicionar.length === 0) {
      setError('Adicione pelo menos um piloto com uma posição');
      return;
    }

    try {
      for (const resultado of resultadosParaAdicionar) {
        await adicionarResultado({
          corrida_id: String(corridaSelecionada),
          piloto_id: resultado.piloto_id,
          posicao: resultado.posicao
        });
      }
      setResultadosRapido({});
      await carregarResultadosCorrida(corridaSelecionada);
      setError('');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao adicionar resultados');
    }
  };

  const handleDeletarResultado = async (id) => {
    try {
      await deletarResultado(id);
      await carregarResultadosCorrida(corridaSelecionada);
    } catch (err) {
      setError('Erro ao deletar resultado');
    }
  };

  const pilotosCorrida = resultados.map((r) => String(r.piloto_id));
  const pilotosDisponiveis = pilotos.filter((p) => !pilotosCorrida.includes(String(p.id)));
  const posicoesCupadas = Object.values(resultadosRapido).map(p => parseInt(p)).filter(p => p);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Resultados</h2>
          <p>Inserir Resultados de Corridas</p>
        </div>
      </div>

      {!isAdmin ? (
        <div className="page-content">
          <Card className="form-card">
            <h3>Consultar resultados</h3>
            <p className="readonly-hint">
              Faça login como administrador para registrar ou alterar posições e pontos dos participantes.
            </p>
            <div className="form">
              <Select
                label="Selecione a Corrida"
                value={corridaSelecionada}
                onChange={(e) => setCorridaSelecionada(e.target.value)}
                options={corridas.map((c) => ({ id: c.id, label: c.nome }))}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
          </Card>
          <Card className="table-card">
            <h3>Resultados da Corrida</h3>
            {!corridaSelecionada ? (
              <div className="empty-state">Selecione uma corrida para ver os resultados</div>
            ) : loading ? (
              <div className="loading">Carregando...</div>
            ) : resultados.length === 0 ? (
              <div className="empty-state">Nenhum resultado registrado para esta corrida</div>
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
                    {resultados.map((resultado) => (
                      <tr key={resultado.id}>
                        <td className="posicao">
                          <strong>{resultado.posicao}º</strong>
                        </td>
                        <td>{resultado.piloto_nome}</td>
                        <td>
                          <strong>{resultado.pontos} pts</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
      <>
      {/* Mode toggle: stacked on narrow screens so each control stays ≥44px tap height */}
      <div className="modo-selector" role="group" aria-label="Modo de entrada de resultados">
        <button
          type="button"
          className={`mode-btn mode-btn--primary ${modo === 'rapido' ? 'active' : ''}`}
          onClick={() => setModo('rapido')}
        >
          Modo rápido (todos de uma vez)
        </button>
        <button
          type="button"
          className={`mode-btn mode-btn--neutral ${modo === 'individual' ? 'active' : ''}`}
          onClick={() => setModo('individual')}
        >
          Um por um
        </button>
      </div>

      {/* MODO RÁPIDO */}
      {modo === 'rapido' && (
        <div className="page-content">
          <Card className="form-card">
            <h3>Modo rápido — adicione todos os resultados de uma vez</h3>

            <form onSubmit={handleAdicionarResultadosRapido} className="form">
              <Select
                label="Selecione a Corrida"
                value={corridaSelecionada}
                onChange={(e) => setCorridaSelecionada(e.target.value)}
                options={corridas.map(c => ({ id: c.id, label: c.nome }))}
              />

              {corridaSelecionada && (
                <>
                  <div className="resultados-panel">
                    <h4 className="resultados-panel__title">Pilotos disponíveis — atribua as posições</h4>

                    <div className="resultados-piloto-grid">
                      {pilotosDisponiveis.length === 0 ? (
                        <div className="resultados-empty-hint">
                          Todos os pilotos já foram adicionados nesta corrida
                        </div>
                      ) : (
                        pilotosDisponiveis.map((piloto) => (
                          <div key={piloto.id} className="resultados-piloto-row">
                            <div className="resultados-piloto-row__meta">
                              <div className="resultados-piloto-row__name">{piloto.nome}</div>
                              <div className="resultados-piloto-row__pts">{piloto.pontos || 0} pts</div>
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="Pos"
                              className={`resultados-pos-input${resultadosRapido[piloto.id] ? ' resultados-pos-input--filled' : ''}`}
                              value={resultadosRapido[piloto.id] || ''}
                              onChange={(e) => {
                                const posicao = e.target.value;
                                const posicaoInt = posicao ? parseInt(posicao) : '';

                                const jaUsada = posicoesCupadas.includes(posicaoInt) && resultadosRapido[piloto.id] !== posicaoInt;

                                if (!jaUsada) {
                                  setResultadosRapido({
                                    ...resultadosRapido,
                                    [piloto.id]: posicao
                                  });
                                } else {
                                  setError('Esta posição já foi atribuída a outro piloto');
                                  setTimeout(() => setError(''), 3000);
                                }
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {Object.keys(resultadosRapido).length > 0 && (
                    <div className="resultados-resumo">
                      <h4 className="resultados-resumo__title">
                        Resumo ({Object.keys(resultadosRapido).length} pilotos)
                      </h4>
                      <div className="resultados-resumo-grid">
                        {Object.entries(resultadosRapido)
                          .filter(([_, posicao]) => posicao)
                          .sort(([_a, posA], [_b, posB]) => parseInt(posA) - parseInt(posB))
                          .map(([pilotoId, posicao]) => {
                            const piloto = pilotos.find((p) => String(p.id) === String(pilotoId));
                            const pontos = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][parseInt(posicao) - 1] || 0;
                            return (
                              <div key={pilotoId} className="resultados-resumo-item">
                                <div className="resultados-resumo-item__pos">{posicao}º</div>
                                <div className="resultados-resumo-item__name">{piloto?.nome}</div>
                                <div className="resultados-resumo-item__pts">{pontos} pts</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {error && <div className="error-message error-message--mt">{error}</div>}

                  <Button
                    type="submit"
                    variant="primary"
                    className="btn--block btn--block-spaced"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Confirmar todos ({Object.keys(resultadosRapido).filter(k => resultadosRapido[k]).length})
                  </Button>
                </>
              )}
            </form>
          </Card>

          {/* Resultados da Corrida */}
          <Card className="table-card">
            <h3>Resultados da Corrida</h3>
            {!corridaSelecionada ? (
              <div className="empty-state">Selecione uma corrida para ver os resultados</div>
            ) : loading ? (
              <div className="loading">Carregando...</div>
            ) : resultados.length === 0 ? (
              <div className="empty-state">Nenhum resultado registrado para esta corrida</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Piloto</th>
                      <th>Pontos</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((resultado) => (
                      <tr key={resultado.id}>
                        <td className="posicao">
                          <strong>{resultado.posicao}º</strong>
                        </td>
                        <td>{resultado.piloto_nome}</td>
                        <td><strong>{resultado.pontos} pts</strong></td>
                        <td className="actions">
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeletarResultado(resultado.id)}
                            title="Deletar resultado"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODO INDIVIDUAL (antigo) */}
      {modo === 'individual' && (
        <div className="page-content grid-2">
          <Card className="form-card">
            <h3>Adicionar um por um</h3>
            <form onSubmit={handleAdicionarResultadosRapido} className="form">
              <Select
                label="Selecione a Corrida"
                value={corridaSelecionada}
                onChange={(e) => setCorridaSelecionada(e.target.value)}
                options={corridas.map(c => ({ id: c.id, label: c.nome }))}
              />
              {corridaSelecionada && (
                <>
                  <Select
                    label="Piloto"
                    value={Object.keys(resultadosRapido).length > 0 ? Object.keys(resultadosRapido)[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const pilotoId = e.target.value;
                        setResultadosRapido({ [pilotoId]: '' });
                      }
                    }}
                    options={pilotosDisponiveis.map(p => ({ id: p.id, label: p.nome }))}
                  />
                  {Object.keys(resultadosRapido).length > 0 && (
                    <Input
                      label="Posição Final"
                      type="number"
                      min="1"
                      max="100"
                      value={resultadosRapido[Object.keys(resultadosRapido)[0]] || ''}
                      onChange={(e) => {
                        const pilotoId = Object.keys(resultadosRapido)[0];
                        setResultadosRapido({ ...resultadosRapido, [pilotoId]: e.target.value });
                      }}
                      placeholder="EX: 1"
                    />
                  )}
                </>
              )}
              {error && <div className="error-message">{error}</div>}
              <Button type="submit" variant="primary">
                <span className="material-symbols-outlined">add_circle</span>
                Confirmar Resultado
              </Button>
            </form>
          </Card>

          <Card className="table-card">
            <h3>Resultados</h3>
            {!corridaSelecionada ? (
              <div className="empty-state">Selecione uma corrida para ver os resultados</div>
            ) : loading ? (
              <div className="loading">Carregando...</div>
            ) : resultados.length === 0 ? (
              <div className="empty-state">Nenhum resultado registrado para esta corrida</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Piloto</th>
                      <th>Pontos</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((resultado) => (
                      <tr key={resultado.id}>
                        <td className="posicao">
                          <strong>{resultado.posicao}º</strong>
                        </td>
                        <td>{resultado.piloto_nome}</td>
                        <td><strong>{resultado.pontos} pts</strong></td>
                        <td className="actions">
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeletarResultado(resultado.id)}
                            title="Deletar resultado"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
      </>
      )}
    </div>
  );
};
