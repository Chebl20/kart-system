// Tabela de pontuação da Fórmula 1
const TABELA_PONTOS_F1 = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1
};

/**
 * Calcula os pontos com base na posição final do piloto
 * @param {number} posicao - Posição final do piloto (1º, 2º, 3º, etc.)
 * @returns {number} Pontos correspondentes à posição
 */
export function calcularPontos(posicao) {
  return TABELA_PONTOS_F1[posicao] || 0;
}

/**
 * Retorna a tabela completa de pontuação
 * @returns {Object} Tabela de pontuação F1
 */
export function getTabelaPontos() {
  return TABELA_PONTOS_F1;
}

/**
 * Calcula os pontos totais de um piloto
 * @param {Array} resultados - Array com todos os resultados do piloto
 * @returns {number} Soma total de pontos
 */
export function calcularPontosTotais(resultados) {
  return resultados.reduce((total, resultado) => total + resultado.pontos, 0);
}
