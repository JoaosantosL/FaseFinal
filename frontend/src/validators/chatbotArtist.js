/**
 * @file chatbotArtist.js
 * @description
 * Joi schema para validação do endpoint de perguntas sobre artistas via chatbot.
 */

const Joi = require("joi");
const sanitize = require("../utils/sanitize");

/**
 * Valida o payload:
 * - artistName: obrigatório, string limpa
 * - question: obrigatório, string com limite de tamanho
 */
const askArtistQuestionSchema = Joi.object({
    artistName: Joi.string().min(2).max(100).required(),
    question: Joi.string().min(5).max(1000).required(),
}).custom((value) => {
    value.artistName = sanitize(value.artistName);
    value.question = sanitize(value.question);
    return value;
});

module.exports = {
    askArtistQuestionSchema,
};
