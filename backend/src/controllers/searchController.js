/**
 * @file searchController.js
 * @description
 * Controlador responsável por realizar a pesquisa global na aplicação.
 * Pesquisa em 3 coleções:
 *  - Músicas (Music)
 *  - Artistas (Artist)
 *  - Álbuns (Album)
 *
 * Boas práticas aplicadas:
 * - Sanitização da query (evita XSS e regex injection)
 * - Logging estruturado com Winston
 * - Uso de `.lean()` e `.select()` para eficiência
 * - Uso de `populate` seletivo
 */

const Music = require("../models/Music");
const Artist = require("../models/Artist");
const Album = require("../models/Album");

const sanitize = require("../utils/sanitize");
const logger = require("../utils/logger");

/**
 * @function globalSearch
 * @description
 * Pesquisa global por artistas, álbuns ou músicas.
 * Aplica filtros para ignorar artistas privados.
 *
 * @route GET /api/search?q=...
 * @access Público
 */
const globalSearch = async (req, res, next) => {
    try {
        // 1. Extrai e sanitiza o termo de pesquisa
        const rawQuery = req.query.q?.trim();
        const query = sanitize(rawQuery);

        if (!query) {
            return res.status(400).json({
                success: false,
                error: "Falta o parâmetro de pesquisa.",
            });
        }

        const regex = new RegExp(query, "i");

        // 2. Pesquisa direta por artista público
        const artista = await Artist.findOne({
            name: regex,
            isPublic: true, // apenas artistas públicos
        }).lean();

        if (artista) {
            // Carrega álbuns e músicas do artista
            const [albums, musics] = await Promise.all([
                Album.find({ artist: artista._id })
                    .select("title coverUrl")
                    .lean(),
                Music.find({
                    artist: artista._id,
                    isDeleted: false,
                })
                    .select("title coverUrl audioUrl artist album")
                    .populate("artist", "name")
                    .populate("album", "title")
                    .lean(),
            ]);

            return res.json({
                success: true,
                context: "artista",
                artista,
                albums,
                musics,
            });
        }

        // 3. Pesquisa por título de álbum (mas verifica se o artista é público)
        const album = await Album.findOne({ title: regex }).lean();
        if (album) {
            // Confirma se o artista associado ao álbum é público
            const artistaDoAlbum = await Artist.findOne({
                _id: album.artist,
                isPublic: true,
            }).lean();

            if (!artistaDoAlbum) {
                return res.status(204).send(); // artista privado → esconder resultados
            }

            const musics = await Music.find({
                album: album._id,
                isDeleted: false,
            })
                .select("title coverUrl audioUrl artist album")
                .populate("artist", "name")
                .populate("album", "title")
                .lean();

            return res.json({
                success: true,
                context: "album",
                album,
                musics,
            });
        }

        // 4. Pesquisa por título de música (filtra artista privado após populate)
        const musicsRaw = await Music.find({
            title: regex,
            isDeleted: false,
        })
            .select("title coverUrl audioUrl artist album")
            .populate("artist", "name isPublic")
            .populate("album", "title")
            .lean();

        // Ignora músicas de artistas não públicos
        const musics = musicsRaw.filter((m) => m.artist?.isPublic);

        return res.json({
            success: true,
            context: "musica",
            musics,
        });
    } catch (err) {
        logger.error("Erro na pesquisa global", {
            query: req.query.q,
            stack: err.stack,
        });
        next(err);
    }
};

module.exports = { globalSearch };
