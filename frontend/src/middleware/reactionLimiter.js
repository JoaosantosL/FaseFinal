/**
 * @file reactionLimiter.js
 * @description
 * Middleware de limitação de reações no endpoint `POST /api/music/:id/react`.
 *
 * Este middleware protege o servidor de abuso ou spam de reações,
 * limitando o número de reações que podem ser enviadas por IP por minuto.
 *
 * Por defeito:
 * - Máximo de 20 reações por IP por minuto
 * - Configurável via variável de ambiente RATE_LIMIT_REACT
 */

const rateLimit = require("express-rate-limit");

/**
 * Middleware de rate-limit específico para reações musicais.
 *
 * Exemplo de uso no router:
 * ```js
 * router.post("/music/:id/react", verifyToken, reactionLimiter, controller.reactToMusic);
 * ```
 *
 * Este tipo de proteção é especialmente útil quando se usa **feedback em tempo real**,
 * como WebSockets, e queremos garantir que não há flood ou abuso do sistema.
 *
 * @constant {Function} reactionLimiter - Middleware configurado com limites razoáveis para produção
 */
const reactionLimiter = rateLimit({
    windowMs: 60 * 1000, // Janela de 1 minuto

    // Máximo de pedidos permitido por IP
    max: process.env.RATE_LIMIT_REACT || 20,

    // Resposta devolvida se o limite for ultrapassado
    message: {
        success: false,
        error: "Muitas reações num curto espaço de tempo. Aguarda um momento.",
        code: 429, // HTTP 429 = Too Many Requests
    },

    // Cabeçalhos modernos (RateLimit-*)
    standardHeaders: true,

    // Cabeçalhos antigos (X-RateLimit-*) desativados
    legacyHeaders: false,
});

module.exports = reactionLimiter;
