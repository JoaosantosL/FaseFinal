/**
 * @file chatbotPlaylistRoutes.js
 * @description
 * Define a rota para gerar playlists via chatbot com OpenAI.
 *
 * POST /api/chatbot/playlist
 * Recebe as respostas do utilizador e uma lista de músicas.
 * Gera uma prompt e envia para a OpenAI.
 */

const express = require("express");
const router = express.Router();

const validate = require("../middleware/validate");
const verifyToken = require("../middleware/verifyToken");
const chatbotPlaylistSchema = require("../validators/chatbotPlaylist");
const {
    generatePlaylistFromChatbot,
} = require("../controllers/chatbotPlaylistController");

/**
 * @route POST /api/chatbot/playlist
 * @description Gera uma playlist com base nas respostas e nas músicas disponíveis
 * @access Privado (JWT)
 */
router.post(
    "/playlist",
    verifyToken,
    validate(chatbotPlaylistSchema, "body"),
    generatePlaylistFromChatbot
);

module.exports = router;
