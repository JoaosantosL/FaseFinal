/**
 * @file auth.js
 * @description
 * Define os schemas de validação Joi para autenticação de utilizadores:
 * - Registo (`registerSchema`)
 * - Login (`loginSchema`)
 *
 * Estes schemas são usados no middleware `validate(schema, "body")` para garantir
 * que os dados enviados pelos utilizadores estão corretos antes de serem processados.
 */

const Joi = require("joi");

// ─────────────────────────────────────────────────────
// REGISTO DE NOVO UTILIZADOR
// ─────────────────────────────────────────────────────

/**
 * Schema Joi para validação de registo de utilizadores.
 *
 * Valida o corpo (`req.body`) com os seguintes campos:
 * - `username`: texto entre 3 e 30 caracteres (obrigatório)
 * - `email`: email com formato válido (obrigatório)
 * - `password`: pelo menos 6 caracteres (obrigatório)
 * - `role`: opcional — "user" ou "artist" (para diferenciar funções)
 *
 * Cada campo inclui mensagens de erro personalizadas para melhor feedback.
 *
 * @type {Joi.ObjectSchema}
 */
const registerSchema = Joi.object({
    body: Joi.object({
        username: Joi.string().min(3).max(30).required().messages({
            "string.base": "O nome de utilizador deve ser texto",
            "string.empty": "O nome de utilizador é obrigatório",
            "string.min": "O nome deve ter pelo menos 3 caracteres",
            "any.required": "O nome de utilizador é obrigatório",
        }),

        email: Joi.string().email().required().messages({
            "string.email": "Email inválido",
            "any.required": "O email é obrigatório",
        }),

        password: Joi.string().min(6).required().messages({
            "string.min": "A password deve ter pelo menos 6 caracteres",
            "any.required": "A password é obrigatória",
        }),

        role: Joi.string().valid("user", "artist").optional(),
    }),
});

// ─────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────

/**
 * Schema Joi para validação de login.
 *
 * Verifica apenas dois campos:
 * - `email`: deve ter formato válido
 * - `password`: deve existir
 *
 * Nota: não é necessário validar o `role` aqui, pois ele é usado apenas no registo.
 *
 * @type {Joi.ObjectSchema}
 */
const loginSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Email inválido",
            "any.required": "O email é obrigatório",
        }),

        password: Joi.string().required().messages({
            "any.required": "A password é obrigatória",
        }),
    }),
});

// Exporta os dois schemas para uso no middleware `validate`
module.exports = {
    registerSchema,
    loginSchema,
};
