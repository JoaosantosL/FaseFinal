/**
 * @file userController.js
 * @description
 * Controladores responsáveis pela gestão da biblioteca pessoal de músicas.
 *
 * Um utilizador pode:
 * - Obter todas as músicas que guardou na sua biblioteca
 * - Adicionar novas músicas à biblioteca
 * - Remover músicas da biblioteca
 * - Ver músicas que deu like
 *
 * Todas estas ações requerem autenticação via JWT e validação de ownership.
 */

const User = require("../models/User");
const Music = require("../models/Music");

const catchAsync = require("../utils/catchAsync");
const leanPublic = require("../utils/leanPublic");
const getOrFail = require("../utils/getOrFail");
const sanitize = require("../utils/sanitize");
const logger = require("../utils/logger");

/**
 * @function getLibrary
 * @description Devolve a biblioteca de músicas de um utilizador, com estatísticas pessoais.
 * @route GET /api/users/:id/library
 * @access Privado
 */
const getLibrary = catchAsync(async (req, res) => {
    const user = await getOrFail(
        User.findById(req.params.id)
            .populate({
                path: "library",
                match: { isDeleted: false },
                select: "-__v -reactions",
            })
            .select("library personalPlays")
            .lean(),
        "Utilizador não encontrado"
    );

    const contadores = {};
    for (const entry of user.personalPlays || []) {
        contadores[entry.music.toString()] = {
            count: entry.count,
            lastPlayedAt: entry.lastPlayedAt,
        };
    }

    const libraryWithStats = user.library.map((music) => ({
        ...music,
        personalPlays: contadores[music._id.toString()]?.count || 0,
        lastPlayedAt: contadores[music._id.toString()]?.lastPlayedAt || null,
    }));

    res.json({ success: true, data: libraryWithStats });
});

/**
 * @function addToLibrary
 * @description Adiciona uma música à biblioteca do utilizador, se ainda não existir.
 * @route POST /api/users/:id/library
 * @access Privado
 */
const addToLibrary = catchAsync(async (req, res) => {
    const musicId = sanitize(req.body.musicId);

    const user = await getOrFail(
        User.findById(req.params.id),
        "Utilizador não encontrado"
    );

    if (user.library.includes(musicId)) {
        return res.status(409).json({
            success: false,
            error: "Música já está na biblioteca",
            code: 409,
        });
    }

    user.library.push(musicId);
    await user.save();

    logger.info(`🎵 Música ${musicId} adicionada à biblioteca de ${user._id}`);

    res.status(201).json({
        success: true,
        message: "Música adicionada à biblioteca",
    });
});

/**
 * @function removeFromLibrary
 * @description Remove uma música da biblioteca do utilizador.
 * @route DELETE /api/users/:id/library/:musicId
 * @access Privado
 */
const removeFromLibrary = catchAsync(async (req, res) => {
    const id = sanitize(req.params.id);
    const musicId = sanitize(req.params.musicId);

    const user = await getOrFail(
        User.findById(id),
        "Utilizador não encontrado"
    );

    const exists = user.library.some((m) => m.toString() === musicId);
    if (!exists) {
        return res.status(404).json({
            success: false,
            error: "Música não encontrada na biblioteca",
            code: 404,
        });
    }

    user.library = user.library.filter((m) => m.toString() !== musicId);
    await user.save();

    logger.info(`🗑️ Música ${musicId} removida da biblioteca de ${user._id}`);

    res.json({
        success: true,
        message: "Música removida da biblioteca",
    });
});

/**
 * @function getLikedMusic
 * @description Devolve a lista de músicas que o utilizador gostou (likes).
 * @route GET /api/users/me/liked
 * @access Privado
 */
const getLikedMusic = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const musics = await Music.find({ likes: userId, isDeleted: false })
        .populate("artist", "name")
        .populate("album", "title")
        .select("title coverUrl audioUrl artist album plays likes")
        .lean();

    const enriched = musics.map((music) => ({
        ...music,
        likesCount: music.likes?.length || 0,
        likedByMe: true,
    }));

    res.json({ success: true, data: enriched });
});

module.exports = {
    getLibrary,
    addToLibrary,
    removeFromLibrary,
    getLikedMusic,
};
