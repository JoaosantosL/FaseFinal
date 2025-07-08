/**
 * @file music.js
 * @description
 * Schemas Joi para validar criação e edição de playlists:
 * - `createPlaylistSchema`: usado na criação de uma nova playlist
 * - `editPlaylistSchema`: usado na edição de uma playlist existente
 *
 * Ambos os schemas validam:
 * - o `id` do utilizador nos `params`
 * - e os dados da playlist no `body`
 */

const Joi = require("joi");

/**
 * Schema de validação para criação de playlist.
 *
 * Verifica:
 * - `body.name`: obrigatório, string com 1 a 50 caracteres
 * - `body.musics`: array opcional de ObjectIds válidos (24 caracteres hexadecimais)
 * - `params.id`: ID do utilizador (obrigatório)
 *
 * Mensagens de erro são personalizadas para feedback claro.
 *
 * @type {Joi.ObjectSchema}
 */
const createPlaylistSchema = Joi.object({
    body: Joi.object({
        name: Joi.string().min(1).max(50).required().messages({
            "string.empty": "O nome da playlist é obrigatório",
        }),

        musics: Joi.array()
            .items(
                Joi.string().hex().length(24).messages({
                    "string.length": "ID de música inválido",
                })
            )
            .default([]), // permite playlists vazias
    }),

    params: Joi.object({
        id: Joi.string().hex().length(24).required().messages({
            "string.length": "ID do utilizador inválido",
        }),
    }),
});

/**
 * Schema de validação para edição de playlist.
 *
 * Verifica:
 * - `body.name`: opcional, string com 1 a 50 caracteres
 * - `body.musics`: opcional, array de ObjectIds válidos
 * - `params.id`: ID do utilizador
 * - `params.playlistId`: ID da playlist
 *
 * Pode ser usado para renomear, substituir músicas, ou ambos.
 *
 * @type {Joi.ObjectSchema}
 */
const editPlaylistSchema = Joi.object({
    body: Joi.object({
        name: Joi.string().min(1).max(50).optional(),

        musics: Joi.array()
            .items(
                Joi.string().hex().length(24).messages({
                    "string.length": "ID de música inválido",
                })
            )
            .optional(),
    }),

    params: Joi.object({
        id: Joi.string().hex().length(24).required(),
        playlistId: Joi.string().hex().length(24).required(),
    }),
});

// Exporta os schemas para uso nas rotas protegidas
module.exports = {
    createPlaylistSchema,
    editPlaylistSchema,
};
