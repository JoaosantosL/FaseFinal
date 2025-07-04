/**
 * @file portugueseMusicController.js
 * @description
 * Controlador dedicado para destacar músicas de artistas portugueses.
 * Usa agregação MongoDB (`$lookup`) para filtrar por `artist.isPortuguese = true`
 *
 * Endpoint: GET /api/music/portuguese
 * Acesso: Público
 */

const mongoose = require("mongoose");
const Music = require("../models/Music");

/**
 * @function getPortugueseMusic
 * @description
 * Retorna até 3 músicas associadas a artistas com `isPortuguese: true`.
 * As músicas incluem artista e álbum (via $lookup).
 *
 * @route GET /api/music/portuguese
 * @access Público
 */
exports.getPortugueseMusic = async (req, res, next) => {
    try {
        const portuguesas = await Music.aggregate([
            // Apenas músicas ativas
            { $match: { isDeleted: false } },

            // Junta artista à música
            {
                $lookup: {
                    from: "artists",
                    localField: "artist",
                    foreignField: "_id",
                    as: "artist",
                },
            },
            { $unwind: "$artist" },

            // Apenas artistas portugueses
            { $match: { "artist.isPortuguese": true } },

            // Junta álbum (opcional)
            {
                $lookup: {
                    from: "albums",
                    localField: "album",
                    foreignField: "_id",
                    as: "album",
                },
            },
            {
                $unwind: {
                    path: "$album",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Seleciona campos relevantes
            {
                $project: {
                    _id: 1,
                    title: 1,
                    coverUrl: 1,
                    audioUrl: 1,
                    plays: 1,
                    artist: {
                        _id: "$artist._id",
                        name: "$artist.name",
                        isPortuguese: "$artist.isPortuguese",
                    },
                    album: {
                        _id: "$album._id",
                        title: "$album.title",
                    },
                },
            },

            // Limita a 3 resultados
            { $sample: { size: 3 } },
        ]);

        if (!portuguesas || portuguesas.length === 0) {
            return res.status(204).send(); // Nenhuma música portuguesa disponível
        }

        res.json({ success: true, data: portuguesas });
    } catch (err) {
        next(err);
    }
};