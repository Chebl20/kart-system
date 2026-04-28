import React, { useState, useEffect } from 'react';
import { getCorridas, criarCorrida, deletarCorrida, editarCorrida } from '../services/api';
import { Card, Button, Input, Select } from '../components/Layout';
import '../styles/pages.css';

export const CorridasPage = () => {
  const [corridas, setCorridas] = useState([]);
  const [formData, setFormData] = useState({ nome: '', data: '', categoria: 'SPRINT' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const categorias = [
    { id: 'SPRINT', label: 'SPRINT' },
    { id: 'ENDURANCE', label: 'ENDURANCE' },
    { id: 'STREET', label: 'STREET' }
  ];

  useEffect(() => {
    carregarCorridas();
  }, []);

  const carregarCorridas = async () => {
    try {
      setLoading(true);
      const response = await getCorridas();
      setCorridas(response.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar corridas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.data) {
      setError('Preenchha todos os campos');
      return;
    }

    try {
      if (editingId) {
        await editarCorrida(editingId, formData);
      } else {
        await criarCorrida(formData);
      }
      setFormData({ nome: '', data: '', categoria: 'SPRINT' });
      setEditingId(null);
      await carregarCorridas();
      setError('');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar corrida');
    }
  };

  const handleDeleteCorrida = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta corrida?')) {
      try {
        await deletarCorrida(id);
        await carregarCorridas();
      } catch (err) {
        setError('Erro ao deletar corrida');
      }
    }
  };

  const handleEdit = (corrida) => {
    setFormData({
      nome: corrida.nome,
      data: corrida.data,
      categoria: corrida.categoria
    });
    setEditingId(corrida.id);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Corridas</h2>
          <p>Gerenciamento de Eventos e Campeonatos</p>
        </div>
        <div className="stats">
          <div className="stat-box">
            <span className="stat-label">Total Programado</span>
            <span className="stat-value">{corridas.length}</span>
          </div>
        </div>
      </div>

      <div className="page-content grid-2">
        {/* Formulário de Cadastro */}
        <Card className="form-card">
          <h3>{editingId ? 'Editar Corrida' : 'Nova Corrida'}</h3>
          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Nome da Corrida"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="EX: Monza Grand Prix"
            />
            <Input
              label="Data do Evento"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
            <Select
              label="Categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              options={categorias}
            />
            {error && <div className="error-message">{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" variant="primary" style={{ flex: 1 }}>
                {editingId ? 'Atualizar' : 'Criar'} Corrida
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFormData({ nome: '', data: '', categoria: 'SPRINT' });
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Lista de Corridas */}
        <Card className="table-card">
          <h3>Próximas Corridas</h3>
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : corridas.length === 0 ? (
            <div className="empty-state">Nenhuma corrida cadastrada</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Pilotos</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {corridas.map((corrida) => (
                    <tr key={corrida.id}>
                      <td>{new Date(corrida.data).toLocaleDateString('pt-BR')}</td>
                      <td className="corrida-nome">{corrida.nome}</td>
                      <td><span className="badge">{corrida.categoria}</span></td>
                      <td>{corrida.total_pilotos || 0}</td>
                      <td className="actions">
                        <button
                          className="btn-icon edit"
                          onClick={() => handleEdit(corrida)}
                          title="Editar corrida"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteCorrida(corrida.id)}
                          title="Deletar corrida"
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
