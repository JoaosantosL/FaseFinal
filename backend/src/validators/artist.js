/**
 * @file artist.js
 * @description
 * Schemas de validação Joi para operações relacionadas com artistas.
 */

const Joi = require("joi");
const sanitize = require("../utils/sanitize");

/**
 * Valida os campos editáveis do perfil artístico:
 * - bio: texto opcional, até 1000 caracteres
 * - percurso: texto opcional, até 1000 caracteres
 * - influences: lista de strings curtas (máx 100 caracteres)
 * - facts: lista de strings curtas (máx 200 caracteres)
 * - isPortuguese: booleano opcional
 * - isPublic: booleano opcional
 * - extraInfo: texto opcional invisível, até 3000 caracteres
 */
const updateArtistSchema = Joi.object({
    bio: Joi.string().max(1000).allow(""),
    percurso: Joi.string().max(1000).allow(""),
    influences: Joi.array().items(Joi.string().max(100)).max(10),
    facts: Joi.array().items(Joi.string().max(200)).max(10),
    isPortuguese: Joi.boolean(),
    isPublic: Joi.boolean(),
    extraInfo: Joi.string().max(3000).allow(""), // 👈 novo campo
}).custom((value) => {
    // ─────────────────────────────────────────────────────
    // Sanitização personalizada
    // ─────────────────────────────────────────────────────

    if (value.bio) value.bio = sanitize(value.bio);
    if (value.percurso) value.percurso = sanitize(value.percurso);
    if (value.extraInfo) value.extraInfo = sanitize(value.extraInfo); // 👈 sanitização

    if (Array.isArray(value.influences)) {
        value.influences = value.influences
            .map((i) => sanitize(i).trim())
            .filter((i) => i.length > 0);
    }

    if (Array.isArray(value.facts)) {
        value.facts = value.facts
            .map((f) => sanitize(f).trim())
            .filter((f) => f.length > 0);
    }

    return value;
});

module.exports = {
    updateArtistSchema,
};
