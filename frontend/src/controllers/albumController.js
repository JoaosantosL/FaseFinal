/**
 * @file albumController.js
 * @description
 * Controladores relacionados com criação e gestão de álbuns musicais.
 */

const Album = require("../models/Album");
const Artist = require("../models/Artist");
const sanitize = require("../utils/sanitize");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

/**
 * @function createAlbum
 * @description
 * Cria um novo álbum associado a um artista autenticado.
 *
 * Requer:
 * - title no corpo do pedido
 * - imagem de capa no campo "cover" (processada por multer)
 * - ID do artista autenticado (via req.params.id)
 *
 * Atualiza:
 * - Cria documento Album
 * - Adiciona album._id ao array albums[] do artista
 * - Devolve o álbum com músicas populadas (mesmo que vazio)
 *
 * @route POST /api/artists/:id/albums
 * @access Privado (apenas artista autenticado e dono)
 */
const createAlbum = catchAsync(async (req, res) => {
    const artistId = req.params.id;

    // Verificação da imagem
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "Imagem de capa não enviada",
        });
    }

    // Validação simples do título
    const title = sanitize(req.body.title || "").trim();
    if (!title || title.length > 200) {
        return res.status(400).json({
            success: false,
            error: "Título do álbum inválido ou em falta",
        });
    }

    // Criação do álbum
    const newAlbum = await Album.create({
        title,
        artist: artistId,
        coverUrl: `/public/uploads/covers/albums/${req.file.filename}`,
    });

    // Atualiza o artista (liga o álbum criado)
    await Artist.findByIdAndUpdate(artistId, {
        $push: { albums: newAlbum._id },
    });

    // Recarrega o álbum com populate nas músicas (mesmo que ainda não haja)
    const populatedAlbum = await Album.findById(newAlbum._id)
        .populate({
            path: "musics",
            match: { isDeleted: false },
            select: "-__v -reactions",
            populate: [
                { path: "artist", select: "name isPublic" },
                { path: "album", select: "title" },
            ],
        })
        .lean();

    logger.info(`Álbum criado com sucesso para artista ${artistId}`);

    res.status(201).json({
        success: true,
        message: "Álbum criado com sucesso",
        data: populatedAlbum,
    });
});

module.exports = {
    createAlbum,
};
