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
      piloto_id: parseInt(piloto_id),
      posicao: parseInt(posicao)
    }));

    if (resultadosParaAdicionar.length === 0) {
      setError('Adicione pelo menos um piloto com uma posição');
      return;
    }

    try {
      for (const resultado of resultadosParaAdicionar) {
        await adicionarResultado({
          corrida_id: parseInt(corridaSelecionada),
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

  const pilotosCorrida = resultados.map(r => r.piloto_id);
  const pilotosDisponiveis = pilotos.filter(p => !pilotosCorrida.includes(p.id));
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
      {/* Seletor de Modo */}
      <div className="modo-selector" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          className={`mode-btn ${modo === 'rapido' ? 'active' : ''}`}
          onClick={() => setModo('rapido')}
          style={{
            padding: '10px 20px',
            border: '2px solid #E10600',
            background: modo === 'rapido' ? '#E10600' : 'transparent',
            color: modo === 'rapido' ? '#fff' : '#E10600',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          ⚡ Modo Rápido (Todos de uma vez)
        </button>
        <button 
          className={`mode-btn ${modo === 'individual' ? 'active' : ''}`}
          onClick={() => setModo('individual')}
          style={{
            padding: '10px 20px',
            border: '2px solid #25252D',
            background: modo === 'individual' ? '#25252D' : 'transparent',
            color: modo === 'individual' ? '#E10600' : '#25252D',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          ➕ Um por Um
        </button>
      </div>

      {/* MODO RÁPIDO */}
      {modo === 'rapido' && (
        <div className="page-content">
          <Card className="form-card">
            <h3>✨ Modo Rápido - Adicione todos os resultados de uma vez</h3>
            
            <form onSubmit={handleAdicionarResultadosRapido} className="form">
              <Select
                label="Selecione a Corrida"
                value={corridaSelecionada}
                onChange={(e) => setCorridaSelecionada(e.target.value)}
                options={corridas.map(c => ({ id: c.id, label: c.nome }))}
              />

              {corridaSelecionada && (
                <>
                  <div style={{ marginTop: '20px', marginBottom: '20px', padding: '15px', background: '#15151E', borderRadius: '4px', border: '1px solid #25252D' }}>
                    <h4 style={{ marginBottom: '15px' }}>Pilotos Disponíveis - Atribua as Posições</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                      {pilotosDisponiveis.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', padding: '20px' }}>
                          ℹ️ Todos os pilotos já foram adicionados nesta corrida
                        </div>
                      ) : (
                        pilotosDisponiveis.map((piloto) => (
                          <div key={piloto.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px',
                            background: '#0a0a0e',
                            border: '1px solid #25252D',
                            borderRadius: '4px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '500' }}>{piloto.nome}</div>
                              <div style={{ fontSize: '12px', color: '#999' }}>{piloto.pontos || 0} pts</div>
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="Pos"
                              value={resultadosRapido[piloto.id] || ''}
                              onChange={(e) => {
                                const posicao = e.target.value;
                                const posicaoInt = posicao ? parseInt(posicao) : '';
                                
                                // Validar se a posição já foi usada
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
                              style={{
                                width: '60px',
                                padding: '8px',
                                background: '#15151E',
                                border: resultadosRapido[piloto.id] ? '2px solid #E10600' : '1px solid #25252D',
                                color: '#fff',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textAlign: 'center'
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Resumo dos Resultados */}
                  {Object.keys(resultadosRapido).length > 0 && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#15151E', borderRadius: '4px', border: '1px solid #25252D' }}>
                      <h4 style={{ marginBottom: '12px' }}>📋 Resumo ({Object.keys(resultadosRapido).length} pilotos)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                        {Object.entries(resultadosRapido)
                          .filter(([_, posicao]) => posicao)
                          .sort(([_a, posA], [_b, posB]) => parseInt(posA) - parseInt(posB))
                          .map(([pilotoId, posicao]) => {
                            const piloto = pilotos.find(p => p.id === parseInt(pilotoId));
                            const pontos = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][parseInt(posicao) - 1] || 0;
                            return (
                              <div key={pilotoId} style={{
                                padding: '10px',
                                background: '#0a0a0e',
                                border: '1px solid #E10600',
                                borderRadius: '4px',
                                textAlign: 'center'
                              }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E10600' }}>{posicao}º</div>
                                <div style={{ fontSize: '12px' }}>{piloto?.nome}</div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FFD700', marginTop: '4px' }}>{pontos} pts</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {error && <div className="error-message" style={{ marginTop: '15px' }}>{error}</div>}

                  <Button 
                    type="submit" 
                    variant="primary"
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Confirmar Todos ({Object.keys(resultadosRapido).filter(k => resultadosRapido[k]).length})
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
            <h3>➕ Adicionar Um por Um</h3>
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
                        const pilotoId = parseInt(e.target.value);
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
