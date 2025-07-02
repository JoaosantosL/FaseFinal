/**
 * @file artistController.js
 * @description
 * Controladores públicos de leitura para artistas e álbuns.
 *
 * Inclui:
 *  - Listagem de artistas
 *  - Detalhes de um artista (com álbuns)
 *  - Detalhes de um álbum (com músicas)
 *
 * Aplica:
 *  - .lean() para melhor performance (sem overhead do Mongoose)
 *  - sanitize-html nos campos bio para evitar XSS
 *  - Utils reutilizáveis: catchAsync, leanPublic, getOrFail, sanitize
 */

const Artist = require("../models/Artist");
const Album = require("../models/Album");

const catchAsync = require("../utils/catchAsync"); // wrapper para try/catch
const leanPublic = require("../utils/leanPublic"); // remove metadados internos
const getOrFail = require("../utils/getOrFail"); // dispara erro se não encontrar
const sanitize = require("../utils/sanitize"); // proteção contra XSS

/**
 * @function getAllArtists
 * @description
 * Devolve a lista de todos os artistas da base de dados.
 *
 * - Usa `.lean()` para melhor performance
 * - Remove os campos "__v" e "albums" com `leanPublic`
 * - Sanitiza o campo `bio` com `sanitize-html`
 *
 * @route GET /api/artists
 * @access Público
 */
const getAllArtists = catchAsync(async (req, res) => {
    const artists = await Artist.find()
        .lean() // devolve objetos simples (POJO)
        .then(leanPublic(["__v", "albums"])); // remove metadados e campo potencialmente pesado

    // Sanitização defensiva do campo bio (evita injeções de código HTML malicioso)
    artists.forEach((artist) => {
        if (artist.bio) artist.bio = sanitize(artist.bio);
    });

    res.json({ success: true, data: artists });
});

/**
 * @function getArtistById
 * @description
 * Devolve os detalhes de um artista específico, incluindo os seus álbuns.
 *
 * - Usa `getOrFail` para lançar erro 404 se não existir
 * - Aplica `.populate("albums")` para carregar os álbuns
 * - Remove campos internos com `leanPublic`
 * - Sanitiza o campo `bio`
 *
 * @route GET /api/artists/:id
 * @access Público
 */
const getArtistById = catchAsync(async (req, res) => {
    const artist = await getOrFail(
        Artist.findById(req.params.id)
            .populate("albums", "-__v") // junta os álbuns, excluindo o campo __v
            .lean()
            .then(leanPublic()), // remove campos internos desnecessários
        "Artista não encontrado"
    );

    // Sanitização contra XSS no campo bio
    if (artist.bio) artist.bio = sanitize(artist.bio);

    res.json({ success: true, data: artist });
});

/**
 * @function getAlbumById
 * @description
 * Devolve os detalhes de um álbum e as suas músicas ativas.
 *
 * - Ignora álbuns marcados como "isDeleted"
 * - Carrega as músicas ativas via `.populate()`
 * - Remove campos internos e reactions
 *
 * @route GET /api/albums/:id
 * @access Público
 */
const getAlbumById = catchAsync(async (req, res) => {
    const album = await getOrFail(
        Album.findOne({ _id: req.params.id, isDeleted: false }) // ignora álbuns eliminados
            .populate({
                path: "musics",
                match: { isDeleted: false },
                select: "-__v -reactions",
                populate: [
                    { path: "artist", select: "name" },
                    { path: "album", select: "title" },
                ],
            })
            .lean()
            .then(leanPublic(["__v", "reactions"])), // remove campos extra também do próprio álbum
        "Álbum não encontrado"
    );

    res.json({ success: true, data: album });
});

// Exportação dos controladores
module.exports = {
    getAllArtists,
    getArtistById,
    getAlbumById,
};
