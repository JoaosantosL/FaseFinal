/**
 * @file musicController.js
 * @description
 * Controladores do repositório global de músicas da aplicação SoundDream.
 *
 * Funcionalidades:
 * - Listar todas as músicas
 * - Obter detalhes de uma música
 * - Registar reproduções
 * - Dar/remover likes
 * - Reagir com emojis (fire, love, etc.)
 *
 * Proteções e boas práticas:
 * - Joi nas rotas (assumido)
 * - Rate-limit aplicado por middleware (assumido)
 * - `lean()` e `leanPublic()` para eficiência e segurança
 * - `getOrFail()` para lidar com recursos inexistentes
 * - `AppError` e `logger` para consistência de erros e logging
 */

const Music = require("../models/Music");
const User = require("../models/User");

const catchAsync = require("../utils/catchAsync");
const leanPublic = require("../utils/leanPublic");
const getOrFail = require("../utils/getOrFail");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { broadcast } = require("../sockets/socketManager");

/**
 * @function getAllMusic
 * @description
 * Devolve a lista completa de músicas disponíveis.
 * Inclui info personalizada sobre likes do utilizador atual.
 *
 * @route GET /api/music
 * @access Privado
 */
const getAllMusic = catchAsync(async (req, res) => {
    const userId = req.user._id.toString();

    const musicListRaw = await Music.find({ isDeleted: false })
        .populate("artist", "name")
        .populate("album", "title")
        .lean()
        .then(leanPublic(["__v", "reactions"]));

    // Adiciona info personalizada por utilizador
    const musicList = musicListRaw.map((music) => {
        const likedByMe = music.likes.some((id) => id.toString() === userId);
        const likesCount = music.likes.length;
        delete music.likes;

        return { ...music, likedByMe, likesCount };
    });

    res.json({ success: true, data: musicList });
});

/**
 * @function registerPlay
 * @description
 * Regista uma reprodução da música. Opcionalmente atualiza estatísticas pessoais.
 *
 * @route POST /api/music/:id/play
 * @access Público (autenticação opcional)
 */
const registerPlay = catchAsync(async (req, res) => {
    const musicId = req.params.id;
    const userId = req.user?._id;

    const music = await getOrFail(
        Music.findOneAndUpdate(
            { _id: musicId, isDeleted: false },
            { $inc: { plays: 1 } },
            { new: true, lean: true, projection: { plays: 1 } }
        ),
        "Música não encontrada"
    );

    // Atualiza estatísticas pessoais do utilizador
    if (userId) {
        const result = await User.updateOne(
            { _id: userId, "personalPlays.music": musicId },
            {
                $inc: { "personalPlays.$.count": 1 },
                $set: { "personalPlays.$.lastPlayedAt": new Date() },
            }
        );

        if (result.modifiedCount === 0) {
            await User.updateOne(
                { _id: userId },
                {
                    $push: {
                        personalPlays: {
                            music: musicId,
                            count: 1,
                            lastPlayedAt: new Date(),
                        },
                    },
                }
            );
        }
    }

    res.json({ success: true, data: { plays: music.plays } });
});

/**
 * @function getMusicById
 * @description
 * Devolve os detalhes completos de uma música com info personalizada de likes.
 *
 * @route GET /api/music/:id
 * @access Privado
 */
const getMusicById = catchAsync(async (req, res) => {
    const music = await getOrFail(
        Music.findOne({ _id: req.params.id, isDeleted: false })
            .populate("artist", "name")
            .populate("album", "title")
            .lean()
            .then(leanPublic(["__v", "reactions"])),
        "Música não encontrada"
    );

    const userId = req.user._id.toString();
    const likedByMe = music.likes.some((id) => id.toString() === userId);
    const likesCount = music.likes.length;
    delete music.likes;

    res.json({ success: true, data: { ...music, likedByMe, likesCount } });
});

/**
 * @function reactToMusic
 * @description
 * Regista uma reação (emoji) à música e emite via WebSocket.
 *
 * @route POST /api/music/:id/react
 * @access Privado
 */
const reactToMusic = catchAsync(async (req, res) => {
    const { reaction } = req.body;
    const music = await getOrFail(
        Music.findOne({ _id: req.params.id, isDeleted: false }),
        "Música não encontrada"
    );

    music.reactions.push({ user: req.user._id, type: reaction });
    await music.save();

    broadcast("music:react", {
        musicId: music._id.toString(),
        userId: req.user._id.toString(),
        type: reaction,
    });

    res.json({ success: true, data: { musicId: music._id, reaction } });
});

/**
 * @function likeMusic
 * @description
 * Adiciona um like do utilizador à música.
 *
 * @route POST /api/music/:id/like
 * @access Privado
 */
const likeMusic = catchAsync(async (req, res) => {
    const musicId = req.params.id;
    const userId = req.user._id;

    const music = await getOrFail(
        Music.findById(musicId),
        "Música não encontrada"
    );

    if (music.likes.includes(userId)) {
        throw new AppError("Já deste like a esta música", 409);
    }

    music.likes.push(userId);
    await music.save();

    res.json({
        success: true,
        data: { musicId, liked: true, totalLikes: music.likes.length },
    });
});

/**
 * @function unlikeMusic
 * @description
 * Remove o like do utilizador à música.
 *
 * @route DELETE /api/music/:id/like
 * @access Privado
 */
const unlikeMusic = catchAsync(async (req, res) => {
    const musicId = req.params.id;
    const userId = req.user._id;

    const music = await getOrFail(
        Music.findById(musicId),
        "Música não encontrada"
    );

    const originalLength = music.likes.length;
    music.likes = music.likes.filter(
        (id) => id.toString() !== userId.toString()
    );

    if (music.likes.length === originalLength) {
        throw new AppError("Ainda não tinhas dado like a esta música", 404);
    }

    await music.save();

    res.json({
        success: true,
        data: { musicId, liked: false, totalLikes: music.likes.length },
    });
});

// ─────────────────────────────────────────────────────────────
// Exportação dos controladores
// ─────────────────────────────────────────────────────────────

module.exports = {
    getAllMusic,
    registerPlay,
    getMusicById,
    reactToMusic,
    likeMusic,
    unlikeMusic,
};
