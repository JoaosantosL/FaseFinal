/**
 * @file getOrFail.js
 * @description
 * Utilitário que executa uma query Mongoose e lança um erro 404
 * se o documento não for encontrado.
 *
 * Este padrão reduz a duplicação de código nos controladores e melhora a legibilidade.
 *
 * Exemplo típico de uso:
 * const user = await getOrFail(User.findById(id).lean(), "Utilizador não encontrado");
 */

const AppError = require("./appError");

/**
 * Executa a query fornecida (ex: findById, findOne, etc.).
 * Se não for encontrado nenhum documento, lança automaticamente um erro 404
 * com a mensagem fornecida. Esse erro é capturado pelo middleware `errorHandler`.
 *
 * @param {Promise<Object|null>} query - Uma Promise Mongoose (ex: Model.findById(...))
 * @param {string} [msg="Recurso não encontrado"] - Mensagem de erro 404 a lançar se o documento não existir
 * @returns {Object} Documento retornado pela query
 * @throws {AppError} - Se não for encontrado nenhum documento
 */
async function getOrFail(query, msg = "Recurso não encontrado") {
    const doc = await query;

    // Se a query não devolveu nenhum documento, lança erro 404
    if (!doc) {
        throw new AppError(msg, 404);
    }

    return doc;
}

module.exports = getOrFail;
