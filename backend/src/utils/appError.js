/**
 * @file appError.js
 * @description
 * Classe de erro personalizada para a aplicação SoundDream.
 *
 * Permite lançar erros com uma mensagem e um código HTTP específico
 * (ex: 404 para "não encontrado", 403 para "proibido").
 *
 * Vantagens:
 * - Torna o tratamento de erros mais simples e organizado
 * - Funciona perfeitamente com o middleware `errorHandler`
 * - Permite diferenciar entre erros de cliente e servidor
 *
 * Exemplo de uso:
 *   throw new AppError("Recurso não encontrado", 404);
 */

class AppError extends Error {
    /**
     * Cria uma nova instância de AppError.
     *
     * @param {string} message - A mensagem a apresentar ao cliente (ex: "Utilizador não encontrado")
     * @param {number} statusCode - O código HTTP do erro (ex: 404, 403). Por omissão: 500 (erro interno).
     */
    constructor(message, statusCode = 500) {
        // Chama o construtor da classe Error (classe base do JavaScript)
        super(message);

        // Código HTTP a devolver (ex: 404)
        this.statusCode = statusCode;

        // Define o tipo de erro: "fail" para erros do cliente (4xx) e "error" para falhas do servidor (5xx)
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

        // Garante que o stack trace ignora este construtor, mostrando onde o erro foi criado
        Error.captureStackTrace(this, this.constructor);
    }
}

// Exporta a classe para que possa ser usada em qualquer parte da aplicação
module.exports = AppError;
