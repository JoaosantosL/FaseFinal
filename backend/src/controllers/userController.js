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
 * @description
 * Devolve a biblioteca pessoal do utilizador autenticado,
 * com contagem de reproduções e data da última escuta.
 * Exclui músicas de artistas privados.
 *
 * @route GET /api/users/:id/library
 * @access Privado
 */
const getLibrary = catchAsync(async (req, res) => {
    // 1. Busca o utilizador e popula a sua biblioteca
    const user = await getOrFail(
        User.findById(req.params.id)
            .populate({
                path: "library",
                match: { isDeleted: false },
                populate: {
                    path: "artist",
                    select: "name isPublic",
                    match: { isPublic: true }, // Apenas artistas públicos
                },
                select: "-__v -reactions",
            })
            .select("library personalPlays")
            .lean(),
        "Utilizador não encontrado"
    );

    // 2. Cria um mapa de estatísticas de reprodução
    const contadores = {};
    for (const entry of user.personalPlays || []) {
        contadores[entry.music.toString()] = {
            count: entry.count,
            lastPlayedAt: entry.lastPlayedAt,
        };
    }

    // 3. Filtra músicas sem artista (foi excluído por ser privado)
    const filteredLibrary = user.library.filter((music) => music.artist);

    // 4. Associa estatísticas personalizadas
    const libraryWithStats = filteredLibrary.map((music) => ({
        ...music,
        personalPlays: contadores[music._id.toString()]?.count || 0,
        lastPlayedAt: contadores[music._id.toString()]?.lastPlayedAt || null,
    }));

    // 5. Envia a biblioteca final
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

    logger.info(`Música ${musicId} adicionada à biblioteca de ${user._id}`);

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

    logger.info(`Música ${musicId} removida da biblioteca de ${user._id}`);

    res.json({
        success: true,
        message: "Música removida da biblioteca",
    });
});

/**
 * @function getLikedMusic
 * @description
 * Devolve a lista de músicas que o utilizador gostou (likes),
 * excluindo músicas cujos artistas estão marcados como privados.
 *
 * @route GET /api/users/me/liked
 * @access Privado
 */
const getLikedMusic = catchAsync(async (req, res) => {
    const userId = req.user._id;

    // 1. Busca todas as músicas com like do utilizador
    const musics = await Music.find({ likes: userId, isDeleted: false })
        .populate("artist", "name isPublic") // Precisamos de saber se o artista é privado
        .populate("album", "title")
        .select("title coverUrl audioUrl artist album plays likes")
        .lean();

    // 2. Filtra músicas de artistas privados
    const publicOnly = musics.filter((music) => music.artist?.isPublic);

    // 3. Enriquecer com estado de like e contagem
    const enriched = publicOnly.map((music) => ({
        ...music,
        likesCount: music.likes?.length || 0,
        likedByMe: true,
    }));

    // 4. Envia resposta
    res.json({ success: true, data: enriched });
});

/**
 * @function getUserProfile
 * @description
 * Devolve o perfil do utilizador autenticado, incluindo:
 * - Dados básicos do utilizador
 * - Dados do artista associado (se aplicável)
 *
 * @route GET /api/users/me/profile
 * @access Privado
 */

const getUserProfile = catchAsync(async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .select("username email role linkedArtist createdAt")
            .populate({
                path: "linkedArtist",
                select: "name bio percurso influences facts imageUrl isPortuguese albums",
            })
            .lean();

        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: "Utilizador não encontrado" });
        }

        res.json({
            success: true,
            data: {
                user,
            },
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @function updateUsername
 * @description Atualiza o nome de utilizador (username)
 * @route PATCH /api/users/:id/username
 * @access Privado (owner)
 */
const updateUsername = catchAsync(async (req, res) => {
    const username = sanitize(req.body.username);

    const updated = await User.findByIdAndUpdate(
        req.params.id,
        { username },
        { new: true }
    )
        .select("username email role linkedArtist createdAt")
        .lean();

    if (!updated) {
        return res.status(404).json({
            success: false,
            error: "Utilizador não encontrado",
        });
    }

    res.status(200).json({
        success: true,
        data: updated,
    });
});

/**
 * @function getUserStats
 * @description Devolve estatísticas do utilizador:
 * - Número de músicas ouvidas (personalPlays)
 * - Número de músicas na biblioteca
 * - Número de playlists criadas
 * @route GET /api/users/me/stats
 * @access Privado
 */
const Playlist = require("../models/Playlist");

const getUserStats = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
        .select("library personalPlays")
        .lean();
    const playlists = await Playlist.countDocuments({
        user: userId,
        isDeleted: false,
    });

    const totalMusicsHeard = (user.personalPlays || []).reduce(
        (acc, play) => acc + play.count,
        0
    );
    const totalInLibrary = (user.library || []).length;

    res.json({
        success: true,
        data: {
            musics: totalMusicsHeard,
            library: totalInLibrary,
            playlists: playlists,
        },
    });
});

/**
 * @function getRecentlyPlayed
 * @description Devolve as últimas músicas ouvidas pelo utilizador, ordenadas por `lastPlayedAt`
 * @route GET /api/users/me/recent
 * @access Privado
 */
const getRecentlyPlayed = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
        .select("personalPlays library")
        .lean();

    if (!user) {
        return res
            .status(404)
            .json({ success: false, error: "Utilizador não encontrado" });
    }

    const recentPlays = (user.personalPlays || [])
        .filter((p) => p.lastPlayedAt)
        .sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt))
        .slice(0, 5);

    const musicIds = recentPlays.map((entry) => entry.music);

    const musics = await Music.find({
        _id: { $in: musicIds },
        isDeleted: false,
    })
        .populate("artist", "name")
        .populate("album", "title")
        .select("title coverUrl audioUrl artist album likes _id")
        .lean();

    const musicMap = Object.fromEntries(
        musics.map((m) => [m._id.toString(), m])
    );

    const librarySet = new Set(user.library.map((id) => id.toString()));

    const ordered = recentPlays
        .map((p) => {
            const m = musicMap[p.music.toString()];
            if (!m) return null;

            return {
                ...m,
                likesCount: m.likes?.length || 0,
                likedByMe: m.likes?.some(
                    (id) => id.toString() === userId.toString()
                ),
                isInLibrary: librarySet.has(m._id.toString()),
            };
        })
        .filter(Boolean);

    res.json({ success: true, data: ordered });
});

module.exports = {
    getLibrary,
    addToLibrary,
    removeFromLibrary,
    getLikedMusic,
    getUserProfile,
    updateUsername,
    getUserStats,
    getRecentlyPlayed,
};
