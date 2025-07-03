/**
 * @file recommendation.js
 * @description
 * Configurações e constantes para o sistema de recomendação de músicas.
 * Define limites, pesos e penalizações para o algoritmo de recomendação.
 */

module.exports = {
    WEIGHTS: {
        like: 3,
        library: 2,
        play: 1,
    },
    CANDIDATE_LIMIT: 200,
    TOP_N: 3,
    PENALTY_BASE: 2,
    MIN_PLAY_THRESHOLD: 5, // valor usado no filtro de contagem
};
