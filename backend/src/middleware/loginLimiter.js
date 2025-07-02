/**
 * @file loginLimiter.js
 * @description
 * Middleware de proteção contra abuso de tentativas de login.
 *
 * Este middleware impede que um utilizador (ou bot) tente fazer login
 * demasiadas vezes seguidas, protegendo contra ataques de força bruta.
 *
 * Por defeito:
 * - Permite no máximo 5 tentativas por minuto por IP
 * - Devolve erro 429 em caso de abuso
 *
 * O limite pode ser ajustado com a variável de ambiente: RATE_LIMIT_LOGIN
 */

const rateLimit = require("express-rate-limit"); // Biblioteca para limitação de pedidos

/**
 * Middleware configurado para limitar tentativas de login por IP.
 *
 * Opções:
 * - windowMs: tempo da janela de análise (1 minuto = 60.000 ms)
 * - max: número máximo de tentativas permitidas nessa janela
 * - message: resposta enviada se o limite for ultrapassado
 */
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: process.env.RATE_LIMIT_LOGIN || 5, // por defeito: 5 tentativas por minuto
    message: {
        success: false,
        error: "Demasiadas tentativas de login. Tente novamente em breve.",
        code: 429, // HTTP 429 = Too Many Requests
    },
});

module.exports = loginLimiter;
