/**
 * @file music.js
 * @description
 * Define o schema Joi para validar reações a músicas.
 *
 * Valida dois aspetos importantes do pedido:
 * - `req.body.reaction`: o tipo de reação (obrigatoriamente "fire" ou "love")
 * - `req.params.id`: o ID da música (ObjectId com 24 caracteres hexadecimais)
 *
 * Usado na rota:
 *   POST /api/music/:id/react
 *   Body: { reaction: "fire" }
 */

const Joi = require("joi");

/**
 * Schema de validação usado para registar uma reação a uma música.
 *
 * Valida:
 * - `params.id`: ID da música (tem de ser um ObjectId válido, com 24 caracteres hexadecimais)
 * - `body.reaction`: deve ser obrigatoriamente uma das opções permitidas: "fire" ou "love"
 *
 * As mensagens de erro são personalizadas para ajudar o utilizador a perceber o que está errado.
 *
 * @type {Joi.ObjectSchema}
 */
const reactionSchema = Joi.object({
    body: Joi.object({
        reaction: Joi.string().valid("fire", "love").required().messages({
            "any.only": "A reação deve ser 'fire' ou 'love'",
            "any.required": "O campo 'reaction' é obrigatório",
        }),
    }),

    params: Joi.object({
        id: Joi.string().hex().length(24).required().messages({
            "string.length": "ID da música inválido",
            "any.required": "ID da música é obrigatório",
        }),
    }),
});

module.exports = { reactionSchema };
