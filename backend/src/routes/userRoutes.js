/**
 * @file userRoutes.js
 * @description
 * Define as rotas privadas relacionadas com o utilizador autenticado:
 * - Biblioteca pessoal (guardar/remover músicas)
 * - Gestão de playlists (criar, editar, apagar, listar)
 *
 * Todas as rotas são protegidas com:
 * - Autenticação via JWT (cookie HttpOnly)
 * - Validação Joi (body e/ou parâmetros)
 * - Verificação de ownership (checkOwnership)
 * - Restrição por papel (authorizeRole: base | premium)
 */

const express = require("express");
const router = express.Router();

// ─────────────────────────────────────────────────────
// Importa os controladores
// ─────────────────────────────────────────────────────

const {
    getLibrary,
    addToLibrary,
    removeFromLibrary,
    getLikedMusic,
    getUserProfile,
    updateUsername,
    getUserStats,
    getRecentlyPlayed,
} = require("../controllers/userController");

const {
    getPlaylistsByUser,
    createPlaylist,
    editPlaylist,
    deletePlaylist,
} = require("../controllers/playlistController");

// ─────────────────────────────────────────────────────
// Middlewares de segurança e validação
// ─────────────────────────────────────────────────────

const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const authorizeRole = require("../middleware/authorizeRole");
const checkOwnership = require("../middleware/checkOwnership");

// ─────────────────────────────────────────────────────
// Schemas de validação com Joi
// ─────────────────────────────────────────────────────

const { addToLibrarySchema } = require("../validators/library");
const {
    createPlaylistSchema,
    editPlaylistSchema,
} = require("../validators/playlist");
const { idSchema } = require("../validators/id");
const { usernameSchema } = require("../validators/user");

// ─────────────────────────────────────────────────────
// Modelos utilizados para validação de ownership
// ─────────────────────────────────────────────────────

const User = require("../models/User");
const Playlist = require("../models/Playlist");

// ─────────────────────────────────────────────────────
// Aplica autenticação global (JWT via cookie) a todas as rotas
// ─────────────────────────────────────────────────────

router.use(verifyToken);

// ─────────────────────────────────────────────────────
// Rotas da biblioteca pessoal
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/users/:id/library
 * @desc Devolve a biblioteca do utilizador autenticado
 * @access Privado (owner)
 */
router.get(
    "/:id/library",
    validate(idSchema, "params"),
    checkOwnership(User, "id", "_id"),
    authorizeRole("base", "premium"),
    getLibrary
);

/**
 * @route POST /api/users/:id/library
 * @desc Adiciona uma música à biblioteca pessoal
 * @access Privado (owner)
 */
router.post(
    "/:id/library",
    validate(addToLibrarySchema), // inclui params e body
    checkOwnership(User, "id", "_id"),
    authorizeRole("base", "premium"),
    addToLibrary
);

/**
 * @route DELETE /api/users/:id/library/:musicId
 * @desc Remove uma música da biblioteca
 * @access Privado (owner)
 */
router.delete(
    "/:id/library/:musicId",
    validate(idSchema, "params"),
    checkOwnership(User, "id", "_id"),
    authorizeRole("base", "premium"),
    removeFromLibrary
);

// ─────────────────────────────────────────────────────
// Rotas de gestão de playlists privadas
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/users/:id/playlists
 * @desc Devolve todas as playlists do utilizador
 * @access Privado (owner)
 */
router.get(
    "/:id/playlists",
    validate(idSchema, "params"),
    checkOwnership(User, "id", "_id"),
    getPlaylistsByUser
);

/**
 * @route POST /api/users/:id/playlists
 * @desc Cria uma nova playlist para o utilizador
 * @access Privado (owner)
 */
router.post(
    "/:id/playlists",
    validate(createPlaylistSchema),
    checkOwnership(User, "id", "_id"),
    authorizeRole("base", "premium"),
    createPlaylist
);

/**
 * @route PATCH /api/users/:id/playlists/:playlistId
 * @desc Edita nome ou músicas de uma playlist existente
 * @access Privado (owner)
 */
router.patch(
    "/:id/playlists/:playlistId",
    validate(editPlaylistSchema),
    checkOwnership(Playlist, "playlistId", "user"),
    authorizeRole("base", "premium"),
    editPlaylist
);

/**
 * @route DELETE /api/users/:id/playlists/:playlistId
 * @desc Apaga logicamente uma playlist (soft-delete)
 * @access Privado (owner)
 */
router.delete(
    "/:id/playlists/:playlistId",
    validate(idSchema, "params"),
    checkOwnership(Playlist, "playlistId", "user"),
    authorizeRole("base", "premium"),
    deletePlaylist
);

/**
 * @route GET /api/users/me/liked
 * @desc Devolve a lista de músicas com like do utilizador
 * @access Privado (JWT obrigatório)
 */
router.get("/me/liked", getLikedMusic);

/**
 * @route GET /api/users/me/profile
 * @desc Devolve perfil completo do utilizador (User + Artist)
 * @access Privado (JWT obrigatório)
 */
router.get("/me/profile", getUserProfile);

/**
 * @route PATCH /api/users/:id
 * @desc Atualiza o username do utilizador
 * @access Privado (owner)
 */
router.patch(
    "/:id/username",
    validate(usernameSchema, "body"),
    checkOwnership(User, "id", "_id"),
    authorizeRole("base", "premium"),
    updateUsername
);

/**
 * @route GET /api/users/me/stats
 * @desc Devolve estatísticas de uso do utilizador autenticado
 * @access Privado (JWT obrigatório)
 */
router.get("/me/stats", getUserStats);

/**
 * @route GET /api/users/me/recent
 * @desc Devolve as músicas recentemente ouvidas pelo utilizador
 * @access Privado (JWT obrigatório)
 */
router.get("/me/recent", getRecentlyPlayed);

// Exporta router para uso no app principal
module.exports = router;