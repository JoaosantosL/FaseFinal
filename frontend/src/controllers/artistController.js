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

const logger = require("../utils/logger");

const catchAsync = require("../utils/catchAsync"); // wrapper para try/catch
const leanPublic = require("../utils/leanPublic"); // remove metadados internos
const getOrFail = require("../utils/getOrFail"); // dispara erro se não encontrar
const sanitize = require("../utils/sanitize"); // proteção contra XSS

/**
 * @function getAllArtists
 * @description
 * Devolve a lista de todos os artistas, com os portugueses primeiro.
 *
 * - Usa `.lean()` para melhor performance
 * - Remove "__v" e "albums" com `leanPublic`
 * - Sanitiza `bio` com `sanitize-html`
 * - Ordena: artistas portugueses primeiro, depois estrangeiros (ambos por nome)
 *
 * @route GET /api/artists
 * @access Público
 */
const getAllArtists = catchAsync(async (req, res) => {
    const allArtists = await Artist.find({ isPublic: true })
        .lean()
        .then(leanPublic(["__v", "albums"]));

    // Sanitização defensiva do campo bio
    allArtists.forEach((artist) => {
        if (artist.bio) artist.bio = sanitize(artist.bio);
    });

    // Separar artistas por nacionalidade
    const portugueses = allArtists
        .filter((a) => a.isPortuguese)
        .sort((a, b) => a.name.localeCompare(b.name));

    const estrangeiros = allArtists
        .filter((a) => !a.isPortuguese)
        .sort((a, b) => a.name.localeCompare(b.name));

    // Resposta ordenada
    res.json({ success: true, data: [...portugueses, ...estrangeiros] });
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
const getArtistById = catchAsync(async (req, res, next) => {
    // 1. Carrega o artista ou dispara erro 404
    const artist = await getOrFail(
        Artist.findById(req.params.id)
            .populate("albums", "-__v")
            .lean()
            .then(leanPublic()),
        "Artista não encontrado"
    );

    // 2. Verifica se o artista está público ou se pertence ao utilizador autenticado
    const isOwner =
        req.user && req.user.linkedArtist?.toString() === artist._id.toString();

    if (!artist.isPublic && !isOwner) {
        return res.status(403).json({
            success: false,
            error: "Este perfil de artista ainda não está publicado.",
        });
    }

    // 3. Sanitiza campo bio (defensivo)
    if (artist.bio) artist.bio = sanitize(artist.bio);

    // 4. Envia resposta
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
    // 1. Procura o álbum (ignorando os eliminados)
    const album = await getOrFail(
        Album.findOne({ _id: req.params.id, isDeleted: false })
            .populate({
                path: "musics",
                match: { isDeleted: false },
                select: "-__v -reactions",
                populate: [
                    { path: "artist", select: "name isPublic" }, // inclui isPublic
                    { path: "album", select: "title" },
                ],
            })
            .lean()
            .then(leanPublic(["__v", "reactions"])),
        "Álbum não encontrado"
    );

    // 2. Verifica se alguma música pertence a um artista privado
    const artistaPrivado = album.musics.some(
        (m) => m.artist && m.artist.isPublic === false
    );

    if (artistaPrivado) {
        return res.status(403).json({
            success: false,
            error: "Este álbum pertence a um artista privado.",
        });
    }

    // 3. Responde com os dados do álbum
    res.json({ success: true, data: album });
});

/**
 * @function updateArtist
 * @description Atualiza os dados do artista autenticado (bio, percurso, etc.)
 * @route PATCH /api/artists/:id
 * @access Privado (só o dono do artista pode editar)
 */
const updateArtist = catchAsync(async (req, res) => {
    const artistId = req.params.id;

    // Sanear apenas strings
    const safeString = (v) => (typeof v === "string" ? sanitize(v) : "");

    const updatedFields = {
        bio: safeString(req.body.bio),
        percurso: safeString(req.body.percurso),
        extraInfo: safeString(req.body.extraInfo),

        influences: Array.isArray(req.body.influences)
            ? req.body.influences
                  .map((i) => safeString(i))
                  .filter((i) => i.length > 0)
            : [],

        facts: Array.isArray(req.body.facts)
            ? req.body.facts
                  .map((f) => safeString(f))
                  .filter((f) => f.length > 0)
            : [],

        isPublic: req.body.isPublic === true,
    };

    const updated = await Artist.findByIdAndUpdate(artistId, updatedFields, {
        new: true,
        runValidators: true,
    })
        .select(
            "name bio percurso extraInfo influences facts imageUrl isPublic isPortuguese"
        )
        .lean();

    if (!updated) {
        return res.status(404).json({
            success: false,
            error: "Artista não encontrado",
        });
    }

    logger.info(`Perfil artístico de ${artistId} atualizado.`);

    res.json({
        success: true,
        message: "Perfil artístico atualizado com sucesso",
        data: updated,
    });
});

/**
 * @function getOwnArtistProfile
 * @description
 * Devolve os dados do perfil artístico do utilizador autenticado.
 *
 * Esta rota é usada por artistas autenticados que pretendem
 * aceder ao seu perfil completo (mesmo que o artista ainda não esteja público).
 *
 * Inclui:
 * - Dados do artista (name, bio, percurso, etc.)
 * - Lista de álbuns com músicas populadas
 * - Sanitização do campo bio
 *
 * @route GET /api/artists/me
 * @access Privado (role "artist" com linkedArtist válido)
 */
const getOwnArtistProfile = catchAsync(async (req, res) => {
    const artistId = req.user.linkedArtist;

    // 1. Verifica se o utilizador tem perfil artístico associado
    if (!artistId) {
        return res.status(403).json({
            success: false,
            error: "Não tens perfil artístico associado.",
        });
    }

    // 2. Carrega o perfil do artista com álbuns e músicas populadas
    const artist = await getOrFail(
        Artist.findById(artistId)
            .populate({
                path: "albums",
                populate: {
                    path: "musics",
                    match: { isDeleted: false },
                    select: "-__v -reactions",
                    populate: [
                        { path: "artist", select: "name isPublic" },
                        { path: "album", select: "title" },
                    ],
                },
                select: "-__v",
            })
            .lean()
            .then(leanPublic()),
        "Perfil de artista não encontrado"
    );

    // 3. Sanitiza campo bio
    if (artist.bio) artist.bio = sanitize(artist.bio);

    // 4. Responde com os dados do artista
    res.json({ success: true, data: artist });
});

/**
 * @function updateArtistImage
 * @description Atualiza a imagem de perfil do artista autenticado.
 *
 * Esta rota usa multer para processar o upload da imagem.
 * O ficheiro é guardado na pasta pública e o URL atualizado no modelo Artist.
 *
 * @route PATCH /api/artists/:id/image
 * @access Privado (role "artist" com linkedArtist válido)
 */

const updateArtistImage = catchAsync(async (req, res) => {
    const artistId = req.params.id;

    // Verifica se o ficheiro foi enviado
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "Nenhuma imagem foi enviada",
        });
    }

    // Extrai o nome do ficheiro guardado por multer
    const filename = req.file.filename;

    // Atualiza o campo imageUrl no modelo Artist
    const updated = await Artist.findByIdAndUpdate(
        artistId,
        { imageUrl: `/public/uploads/covers/artists/${filename}` },
        { new: true }
    )
        .select("imageUrl name")
        .lean();

    if (!updated) {
        return res.status(404).json({
            success: false,
            error: "Artista não encontrado",
        });
    }

    logger.info(`Imagem de perfil atualizada para artista ${artistId}`);

    res.json({
        success: true,
        message: "Imagem atualizada com sucesso",
        data: updated,
    });
});

// Exportação dos controladores
module.exports = {
    getAllArtists,
    getArtistById,
    getAlbumById,
    updateArtist,
    getOwnArtistProfile,
    updateArtistImage,
};
