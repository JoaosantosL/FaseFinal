/**
 * @file chatbotPlaylist.js
 * @description
 * Validador Joi para o endpoint do chatbot de playlists.
 * Verifica se as respostas do utilizador estão no formato esperado.
 */

const Joi = require("joi");

const chatbotPlaylistSchema = Joi.object({
    answers: Joi.object()
        .pattern(Joi.string(), Joi.string().trim().max(200))
        .required(),
});

module.exports = chatbotPlaylistSchema;
