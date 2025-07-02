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
 * @description Pesquisa global por músicas, artistas e álbuns.
 *
 * - Prioridade: artista → álbum → título da música
 * - Usa regex case-insensitive
 * - Resposta estruturada com campo `context`
 * - Sanitiza input para evitar abusos
 *
 * @route GET /api/search?q=...
 * @access Público
 *
 * @param {Request} req - Express request (espera query.q)
 * @param {Response} res - Express response
 * @param {Function} next - Função next para tratamento de erros
 */
const globalSearch = async (req, res, next) => {
    try {
        // Extrai e sanitiza o termo de pesquisa
        const rawQuery = req.query.q?.trim();
        const query = sanitize(rawQuery);

        if (!query) {
            return res.status(400).json({
                success: false,
                error: "Falta o parâmetro de pesquisa.",
            });
        }

        const regex = new RegExp(query, "i");

        // Verifica se corresponde a um artista
        const artista = await Artist.findOne({ name: regex }).lean();
        if (artista) {
            const [albums, musics] = await Promise.all([
                Album.find({ artist: artista._id })
                    .select("title coverUrl")
                    .lean(),
                Music.find({ artist: artista._id, isDeleted: false })
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

        // Verifica se corresponde a um álbum
        const album = await Album.findOne({ title: regex }).lean();
        if (album) {
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

        // Caso contrário, pesquisa por título de música
        const musics = await Music.find({ title: regex, isDeleted: false })
            .select("title coverUrl audioUrl artist album")
            .populate("artist", "name")
            .populate("album", "title")
            .lean();

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

// Exportação para uso no router
module.exports = { globalSearch };
