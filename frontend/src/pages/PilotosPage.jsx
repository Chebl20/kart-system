import React, { useState, useEffect } from 'react';
import { getPilotos, criarPiloto, deletarPiloto } from '../services/api';
import { Card, Button, Input } from '../components/Layout';
import '../styles/pages.css';

export const PilotosPage = () => {
  const [pilotos, setPilotos] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarPilotos();
  }, []);

  const carregarPilotos = async () => {
    try {
      setLoading(true);
      const response = await getPilotos();
      setPilotos(response.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar pilotos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarPiloto = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setError('Digite o nome do piloto');
      return;
    }

    try {
      await criarPiloto(novoNome);
      setNovoNome('');
      await carregarPilotos();
      setError('');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao criar piloto');
    }
  };

  const handleDeletarPiloto = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este piloto?')) {
      try {
        await deletarPiloto(id);
        await carregarPilotos();
      } catch (err) {
        setError('Erro ao deletar piloto');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Pilotos</h2>
          <p>Gerenciamento de Atletas e Equipes</p>
        </div>
        <div className="stats">
          <div className="stat-box">
            <span className="stat-label">Total Ativos</span>
            <span className="stat-value">{pilotos.length}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Vagas Livres</span>
            <span className="stat-value">08</span>
          </div>
        </div>
      </div>

      <div className="page-content grid-2">
        {/* Formulário de Cadastro */}
        <Card className="form-card">
          <h3>Novo Cadastro</h3>
          <form onSubmit={handleCriarPiloto} className="form">
            <Input
              label="Nome Completo"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="EX: AYRTON SENNA"
            />
            {error && <div className="error-message">{error}</div>}
            <Button type="submit" variant="primary">
              <span className="material-symbols-outlined">add_circle</span>
              Confirmar Registro
            </Button>
          </form>
        </Card>

        {/* Lista de Pilotos */}
        <Card className="table-card">
          <h3>Grid de Pilotos</h3>
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : pilotos.length === 0 ? (
            <div className="empty-state">Nenhum piloto cadastrado</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Piloto</th>
                    <th>Pontos</th>
                    <th>Corridas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pilotos.map((piloto, index) => (
                    <tr key={piloto.id}>
                      <td className="rank">{index + 1}</td>
                      <td className="piloto">{piloto.nome}</td>
                      <td>{piloto.pontos}</td>
                      <td>{piloto.corridas_participadas || 0}</td>
                      <td className="actions">
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeletarPiloto(piloto.id)}
                          title="Deletar piloto"
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
    </div>
  );
};
