/**
 * @file library.js
 * @description
 * Define o esquema Joi para validar os dados ao adicionar uma música à biblioteca pessoal de um utilizador.
 *
 * Esta validação é aplicada em dois locais:
 * - `params.id`: identifica o utilizador (ID na URL)
 * - `body.musicId`: identifica a música a adicionar (ID no corpo do pedido)
 *
 * Exemplo de rota:
 *   POST /api/users/:id/library
 *   Body: { musicId: "64c123f7a5d3ab1234567890" }
 */

const Joi = require("joi");

/**
 * Validação para a rota:
 *   POST /api/users/:id/library
 *
 * Valida:
 * - `params.id` → deve ser um ObjectId de 24 caracteres (ID do utilizador)
 * - `body.musicId` → também deve ser um ObjectId válido (ID da música a adicionar)
 *
 * `.unknown(true)` permite ignorar campos extra que não estão definidos aqui,
 * o que é útil para evitar falhas em casos onde outros dados são enviados.
 *
 * @type {Joi.ObjectSchema}
 */
const addToLibrarySchema = Joi.object({
    params: Joi.object({
        id: Joi.string().hex().length(24).required().messages({
            "string.length": "ID do utilizador inválido",
            "any.required": "O ID do utilizador é obrigatório",
        }),
    }).unknown(true),

    body: Joi.object({
        musicId: Joi.string().hex().length(24).required().messages({
            "string.length": "ID da música inválido",
            "any.required": "O campo musicId é obrigatório",
        }),
    }).unknown(true),
});

module.exports = { addToLibrarySchema };
