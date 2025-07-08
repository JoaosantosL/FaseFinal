/**
 * @file errorHandler.js
 * @description
 * Middleware global de tratamento de erros para a aplicação SoundDream.
 *
 * Objetivos:
 * - Intercetar erros que ocorrem nos controladores ou middlewares
 * - Registar os erros com detalhes úteis usando Winston (ficheiro + consola)
 * - Devolver uma resposta JSON consistente para o frontend
 */

const logger = require("../utils/logger"); // Sistema de logging (Winston)
const AppError = require("../utils/appError"); // Classe de erros personalizados

/**
 * Middleware de erro do Express (com os 4 parâmetros obrigatórios).
 * Esta função será chamada sempre que houver um erro não tratado no `next(err)`.
 *
 * @param {Error} err - Objeto de erro (pode ser AppError ou erro inesperado)
 * @param {Request} req - Pedido HTTP
 * @param {Response} res - Resposta HTTP
 * @param {Function} _next - Parâmetro necessário para o Express, mesmo que não seja usado
 */
function errorHandler(err, req, res, _next) {
    // 1. Verifica se o erro é "operacional" (esperado) ou se é um bug
    const isOperational = err instanceof AppError;

    // Define o código de estado e a mensagem final a devolver
    const statusCode = isOperational ? err.statusCode : 500;
    const message = isOperational ? err.message : "Erro interno no servidor";

    // 2. Regista o erro com contexto (rota, método, utilizador, stack trace)
    logger.error(message, {
        statusCode, // ex: 404 ou 500
        route: req.originalUrl, // ex: /api/music/xyz
        method: req.method, // ex: GET, POST
        user: req.user ? req.user.id : "guest",
        stack: err.stack, // linha e ficheiro do erro (ajuda no debug)
    });

    // 3. Envia resposta JSON padronizada para o frontend
    res.status(statusCode).json({
        success: false,
        error: message,
        code: statusCode,
    });
}

module.exports = errorHandler;
