/**
 * @file playLimiter.js
 * @description
 * Middleware de limitação de chamadas ao endpoint de reprodução de músicas.
 *
 * Previne abuso ou spam do tipo "bot clicando no play", protegendo o endpoint
 * `POST /api/music/:id/play` com um número máximo de chamadas por IP.
 *
 * Por defeito:
 * - Máximo de 50 reproduções por IP por minuto
 * - Limite configurável através da variável RATE_LIMIT_PLAY no .env
 */

const rateLimit = require("express-rate-limit"); // Biblioteca para rate limiting

/**
 * Middleware de proteção aplicado ao endpoint de reprodução (play).
 *
 * Este middleware assegura que o mesmo IP não consegue registar centenas
 * de reproduções por minuto, o que poderia distorcer estatísticas ou sobrecarregar o servidor.
 *
 * @constant {Function} playLimiter - Middleware configurado com limites apropriados
 */
const playLimiter = rateLimit({
    windowMs: 60 * 1000, // Janela de tempo: 1 minuto (60 mil milissegundos)
    max: process.env.RATE_LIMIT_PLAY || 50, // Limite de chamadas permitido por IP

    // Mensagem devolvida se o utilizador ultrapassar o limite
    message: {
        success: false,
        error: "Excesso de reproduções. Tenta de novo dentro de instantes.",
        code: 429, // HTTP 429 = Too Many Requests
    },

    // Envia cabeçalhos modernos que indicam limites ao cliente
    standardHeaders: true, // inclui RateLimit-Limit, RateLimit-Remaining, etc.

    // Desativa os cabeçalhos antigos (X-RateLimit-*)
    legacyHeaders: false,
});

module.exports = playLimiter;
