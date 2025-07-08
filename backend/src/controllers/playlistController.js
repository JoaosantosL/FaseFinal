/**
 * @file playlistController.js
 * @description
 * Controladores responsáveis pela gestão das playlists pessoais dos utilizadores.
 *
 * Funcionalidades:
 * - Listar playlists de um utilizador autenticado
 * - Criar uma nova playlist
 * - Editar o nome ou músicas de uma playlist
 * - Eliminar logicamente (soft-delete)
 *
 * Aplica:
 * - Middleware `catchAsync` para capturar erros async
 * - Sanitização de campos livres com `sanitize`
 * - Limpeza de metadados com `leanPublic`
 * - Verificação de existência com `getOrFail`
 */

const Playlist = require("../models/Playlist");

const catchAsync = require("../utils/catchAsync");
const sanitize = require("../utils/sanitize");
const leanPublic = require("../utils/leanPublic");
const getOrFail = require("../utils/getOrFail");

/**
 * @function getPlaylistsByUser
 * @description
 * Devolve todas as playlists de um utilizador (ativas),
 * excluindo músicas de artistas privados.
 *
 * @route GET /api/users/:id/playlists
 * @access Privado (com verificação de ownership)
 */
const getPlaylistsByUser = catchAsync(async (req, res) => {
    const playlists = await Playlist.find({
        user: req.params.id,
        isDeleted: false,
    })
        .populate({
            path: "musics",
            match: { isDeleted: false }, // só músicas não apagadas
            select: "-__v -reactions",
            populate: {
                path: "artist",
                select: "isPublic", // para filtrar músicas de artistas privados
            },
        })
        .lean()
        .then(leanPublic(["__v", "reactions"]));

    // Filtra músicas de artistas privados dentro de cada playlist
    const playlistsFiltradas = playlists.map((pl) => ({
        ...pl,
        musics: pl.musics.filter((m) => m.artist?.isPublic),
    }));

    res.json({ success: true, data: playlistsFiltradas });
});

/**
 * @function createPlaylist
 * @description
 * Cria uma nova playlist associada ao utilizador autenticado.
 * Aplica sanitização ao nome e usa diretamente os IDs de músicas se fornecidos.
 *
 * @route POST /api/users/:id/playlists
 * @access Privado
 *
 * @param {Request} req - Pedido com body: { name, musics }
 * @param {Response} res - Resposta com playlist criada
 */
const createPlaylist = catchAsync(async (req, res) => {
    const name = sanitize(req.body.name); // remove HTML
    const { musics } = req.body;

    const playlist = await Playlist.create({
        name,
        user: req.params.id,
        musics,
    });

    res.status(201).json({
        success: true,
        data: leanPublic(["__v"])(playlist.toObject()), // converte Mongoose doc em POJO e limpa
    });
});

/**
 * @function editPlaylist
 * @description
 * Atualiza o nome, lista de músicas ou adiciona/remove uma música individualmente.
 * Impede adicionar músicas de artistas privados.
 *
 * @route PATCH /api/users/:id/playlists/:playlistId
 * @access Privado
 */
const editPlaylist = catchAsync(async (req, res) => {
    const { name, musics, musicId, remove } = req.body;

    const playlist = await getOrFail(
        Playlist.findOne({
            _id: req.params.playlistId,
            user: req.params.id,
        }),
        "Playlist não encontrada"
    );

    // Atualiza o nome (com sanitização)
    if (name) {
        playlist.name = sanitize(name);
    }

    // Substitui todas as músicas, validando os artistas
    if (Array.isArray(musics)) {
        const Music = require("../models/Music");

        const validMusics = await Music.find({
            _id: { $in: musics },
            isDeleted: false,
        })
            .populate("artist", "isPublic")
            .select("_id")
            .lean();

        // Filtra músicas com artistas públicos
        const filtered = validMusics.filter((m) => m.artist?.isPublic);

        // Guarda os IDs das músicas válidas
        playlist.musics = filtered.map((m) => m._id);
    }

    // Adiciona ou remove uma música individual
    if (musicId) {
        const alreadyIn = playlist.musics.some((m) => m.toString() === musicId);

        if (remove) {
            playlist.musics = playlist.musics.filter(
                (m) => m.toString() !== musicId
            );
        } else {
            if (!alreadyIn) {
                // Verifica se o artista é público
                const Music = require("../models/Music");
                const music = await Music.findById(musicId)
                    .populate("artist", "isPublic")
                    .lean();

                if (!music || !music.artist?.isPublic || music.isDeleted) {
                    return res.status(400).json({
                        success: false,
                        error: "Não é possível adicionar esta música.",
                    });
                }

                playlist.musics.push(musicId);
            }
        }
    }

    await playlist.save();

    res.json({
        success: true,
        data: leanPublic(["__v"])(playlist.toObject()),
    });
});

/**
 * @function deletePlaylist
 * @description
 * Realiza soft-delete da playlist, marcando como eliminada.
 * Isto permite preservar dados mas esconder do frontend.
 *
 * @route DELETE /api/users/:id/playlists/:playlistId
 * @access Privado
 *
 * @param {Request} req - Parâmetros da rota: id (user), playlistId
 * @param {Response} res - Mensagem de sucesso
 */
const deletePlaylist = catchAsync(async (req, res) => {
    await getOrFail(
        Playlist.findOneAndUpdate(
            {
                _id: req.params.playlistId,
                user: req.params.id,
                isDeleted: false,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        ),
        "Playlist não encontrada"
    );

    res.json({
        success: true,
        message: "Playlist removida com sucesso",
    });
});

// Exporta os controladores como módulo
module.exports = {
    getPlaylistsByUser,
    createPlaylist,
    editPlaylist,
    deletePlaylist,
};
