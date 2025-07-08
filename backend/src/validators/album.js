/**
 * @file album.js
 * @description
 * Schema Joi para validação de criação de álbuns.
 * Permite campos: title (obrigatório), releaseDate (opcional).
 */

const Joi = require("joi");
const sanitize = require("../utils/sanitize");

const createAlbumSchema = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    releaseDate: Joi.date().optional(),
}).custom((value) => {
    // Sanitiza o campo title
    if (value.title) {
        value.title = sanitize(value.title);
    }
    return value;
});

module.exports = {
    createAlbumSchema,
};
