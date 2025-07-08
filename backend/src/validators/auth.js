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
 * - `role`: opcional — "base" ou "premium"
 * - `artistName`: obrigatório se `role === "premium"`
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

        role: Joi.string().valid("base", "premium").optional().messages({
            "any.only": "O tipo de utilizador deve ser 'base' ou 'premium'",
        }),

        artistName: Joi.when("role", {
            is: "premium",
            then: Joi.string().min(2).max(100).required().messages({
                "string.min":
                    "O nome artístico deve ter pelo menos 2 caracteres",
                "any.required": "O nome artístico é obrigatório para premium",
            }),
            otherwise: Joi.forbidden(),
        }),
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

module.exports = {
    registerSchema,
    loginSchema,
};