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
 * Devolve todas as playlists de um utilizador (que não estejam eliminadas).
 * Aplica `populate` nas músicas e remove campos internos com `leanPublic`.
 *
 * @route GET /api/users/:id/playlists
 * @access Privado (com verificação de ownership)
 *
 * @param {Request} req - Pedido Express
 * @param {Response} res - Resposta Express
 */
const getPlaylistsByUser = catchAsync(async (req, res) => {
    const playlists = await Playlist.find({
        user: req.params.id,
        isDeleted: false, // apenas playlists ativas
    })
        .populate({
            path: "musics",
            match: { isDeleted: false }, // ignora músicas eliminadas
            select: "-__v -reactions", // evita dados pesados e internos
        })
        .lean()
        .then(leanPublic(["__v", "reactions"])); // limpa campos adicionais

    res.json({ success: true, data: playlists });
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
 * Permite múltiplos modos de edição num só pedido.
 *
 * @route PATCH /api/users/:id/playlists/:playlistId
 * @access Privado
 *
 * @param {Request} req - Pedido com campos opcionais: name, musics, musicId, remove
 * @param {Response} res - Resposta com playlist atualizada
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

    // Atualiza o nome se for fornecido
    if (name) {
        playlist.name = sanitize(name);
    }

    // Substitui todas as músicas se for fornecido um array
    if (Array.isArray(musics)) {
        playlist.musics = musics;
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
