/**
 * @file id.js
 * @description
 * Joi-schema reutilizável para validar parâmetros de rota que contenham um `ObjectId` do MongoDB.
 *
 * O `ObjectId` é sempre uma string hexadecimal com exatamente 24 caracteres.
 * Este schema é aplicado normalmente aos parâmetros (`params`) de rotas que usam `/:id`.
 *
 * Exemplo de uso:
 *   router.get("/:id", validate(idSchema, "params"), controllerFunction)
 */

const Joi = require("joi");

/**
 * Schema Joi que valida um parâmetro de rota chamado `id`.
 *
 * Regras aplicadas:
 * - Deve ser uma string com caracteres hexadecimais (0-9, a-f)
 * - Deve ter exatamente 24 caracteres (tamanho de um Mongo ObjectId)
 * - Deve estar presente (`required`)
 *
 * Mensagens personalizadas ajudam a identificar rapidamente erros comuns.
 *
 * @type {Joi.ObjectSchema}
 */
const idSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        "string.length": "ID inválido",
        "any.required": "O ID é obrigatório",
    }),
});

module.exports = { idSchema };
