import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// PILOTOS
export const getPilotos = () => api.get('/pilotos');
export const getPilotoById = (id) => api.get(`/pilotos/${id}`);
export const criarPiloto = (nome) => api.post('/pilotos', { nome });
export const deletarPiloto = (id) => api.delete(`/pilotos/${id}`);

// CORRIDAS
export const getCorridas = () => api.get('/corridas');
export const getCorridaById = (id) => api.get(`/corridas/${id}`);
export const criarCorrida = (dados) => api.post('/corridas', dados);
export const editarCorrida = (id, dados) => api.put(`/corridas/${id}`, dados);
export const deletarCorrida = (id) => api.delete(`/corridas/${id}`);

// RESULTADOS
export const getResultados = () => api.get('/resultados');
export const adicionarResultado = (dados) => api.post('/resultados', dados);
export const editarResultado = (id, dados) => api.put(`/resultados/${id}`, dados);
export const deletarResultado = (id) => api.delete(`/resultados/${id}`);
export const getRankingGeral = () => api.get('/resultados/ranking/geral');
export const getHistoricoCorridas = () => api.get('/resultados/historico/corridas');

export default api;
