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
const Album = require("../models/Album");
const Artist = require("../models/Artist");

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
        .populate({
            path: "artist",
            select: "name isPublic", // vamos verificar se é público
        })
        .populate("album", "title")
        .lean()
        .then(leanPublic(["__v", "reactions"]));

    // Filtra músicas com artistas não públicos
    const filtered = musicListRaw.filter((music) => {
        return music.artist && music.artist.isPublic !== false;
    });

    // Adiciona info personalizada por utilizador
    const musicList = filtered.map((music) => {
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

    // Verifica se a música existe e não está apagada
    const music = await getOrFail(
        Music.findOne({ _id: musicId, isDeleted: false })
            .populate("artist", "isPublic")
            .lean(),
        "Música não encontrada"
    );

    // Impede contagem se artista for privado
    if (!music.artist || music.artist.isPublic === false) {
        throw new AppError("Esta música pertence a um artista privado", 403);
    }

    // Incrementa plays
    const updated = await Music.findByIdAndUpdate(
        musicId,
        { $inc: { plays: 1 } },
        { new: true, projection: { plays: 1 } }
    ).lean();

    // Atualiza estatísticas pessoais se for user autenticado
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

    res.json({ success: true, data: { plays: updated.plays } });
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
            .populate("artist", "name isPublic")
            .populate("album", "title")
            .lean()
            .then(leanPublic(["__v", "reactions"])),
        "Música não encontrada"
    );

    // Bloqueia acesso se o artista for privado
    if (!music.artist || music.artist.isPublic === false) {
        throw new AppError("Esta música pertence a um artista privado", 403);
    }

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
    const music = await getOrFail(
        Music.findById(req.params.id).populate("artist", "isPublic"),
        "Música não encontrada"
    );

    // Impede likes se artista for privado
    if (!music.artist || music.artist.isPublic === false) {
        throw new AppError("Esta música pertence a um artista privado", 403);
    }

    const userId = req.user._id;
    if (music.likes.includes(userId)) {
        throw new AppError("Já deste like a esta música", 409);
    }

    music.likes.push(userId);
    await music.save();

    res.json({
        success: true,
        data: {
            musicId: music._id,
            liked: true,
            totalLikes: music.likes.length,
        },
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
    const music = await getOrFail(
        Music.findById(req.params.id).populate("artist", "isPublic"),
        "Música não encontrada"
    );

    // Impede unlikes se artista for privado
    if (!music.artist || music.artist.isPublic === false) {
        throw new AppError("Esta música pertence a um artista privado", 403);
    }

    const userId = req.user._id;
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
        data: {
            musicId: music._id,
            liked: false,
            totalLikes: music.likes.length,
        },
    });
});

/**
 * @function createMusic
 * @description
 * Cria uma nova música associada a um artista (e opcionalmente a um álbum).
 *
 * - Recebe os campos textuais (title, album) já validados
 * - Recebe os ficheiros via multer: `audio` e `cover`
 * - Deteta a duração automaticamente com `music-metadata`
 * - Cria o documento Music na base de dados
 * - Atualiza o álbum (se existir) com a nova música
 *
 * @route POST /api/artists/:id/musics
 * @access Privado (apenas artista dono do perfil)
 */

const mm = require("music-metadata");
const fs = require("fs");
const path = require("path");

const createMusic = catchAsync(async (req, res) => {
    const artistId = req.params.id;
    const { title, album } = req.body;

    // Verificação dos ficheiros
    if (!req.files?.audio || !req.files?.cover) {
        return res.status(400).json({
            success: false,
            error: "É necessário enviar o ficheiro de áudio e a imagem de capa.",
        });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover[0];

    // Caminhos relativos para guardar no modelo
    const audioUrl = `/public/uploads/audio/${audioFile.filename}`;
    const coverUrl = `/public/uploads/covers/musics/${coverFile.filename}`;

    // Caminho absoluto do ficheiro de áudio
    const audioPath = path.join(__dirname, "../../", audioUrl);

    // Deteta a duração do ficheiro de áudio em segundos
    let duration = 0;
    try {
        const metadata = await mm.parseFile(audioPath);
        duration = Math.floor(metadata.format.duration); // duração arredondada em segundos
    } catch (err) {
        logger.error("Erro ao ler duração do áudio", { err });
        return res.status(400).json({
            success: false,
            error: "Não foi possível determinar a duração da música.",
        });
    }

    // Criação do documento Music
    const newMusic = await Music.create({
        title,
        artist: artistId,
        album: album || undefined,
        duration,
        coverUrl,
        audioUrl,
    });

    // Atualiza o álbum se existir
    if (album) {
        await Album.findByIdAndUpdate(album, {
            $push: { musics: newMusic._id },
        });
    }

    logger.info(`Nova música criada: ${title} (${newMusic._id})`);

    res.status(201).json({
        success: true,
        message: "Música criada com sucesso",
        data: newMusic,
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
    createMusic,
};
