/**
 * @file registerLimiter.js
 * @description
 * Middleware de limitação de registos (`POST /api/auth/register`).
 *
 * Este middleware evita que bots ou scripts façam múltiplos registos seguidos,
 * o que poderia gerar spam de contas ou sobrecarregar o sistema.
 *
 * Por defeito:
 * - Máximo de 10 registos por IP por minuto
 * - Configurável via variável de ambiente RATE_LIMIT_REGISTER
 */

const rateLimit = require("express-rate-limit");

/**
 * Middleware de rate-limit específico para o endpoint de registo.
 *
 * Exemplo de uso no router:
 * ```js
 * router.post("/auth/register", registerLimiter, controller.register);
 * ```
 *
 * Este tipo de limitação é especialmente importante em ambientes públicos
 * onde qualquer pessoa pode criar conta.
 *
 * @constant {Function} registerLimiter - Middleware de proteção contra spam de registos
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 1000, // Janela de 1 minuto (60.000 ms)

    // Número máximo de registos permitidos por IP nesse intervalo
    max: process.env.RATE_LIMIT_REGISTER || 10,

    // Mensagem devolvida se o limite for atingido
    message: {
        success: false,
        error: "Demasiadas tentativas de registo. Tente novamente em breve.",
        code: 429, // HTTP 429 = Too Many Requests
    },
});

module.exports = registerLimiter;
