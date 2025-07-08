const Joi = require("joi");

/**
 * @schema usernameSchema
 * Valida a alteração do nome de utilizador.
 * - Deve ter entre 3 e 30 caracteres.
 */
const usernameSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
        "string.base": "O nome de utilizador deve ser texto",
        "string.empty": "O nome de utilizador é obrigatório",
        "string.min": "O nome deve ter pelo menos 3 caracteres",
        "any.required": "O nome de utilizador é obrigatório",
    }),
});

module.exports = {
    usernameSchema,
};
