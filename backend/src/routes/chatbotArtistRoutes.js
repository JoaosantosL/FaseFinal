/**
 * @file chatbotArtistRoutes.js
 * @description
 * Define as rotas relacionadas com o chatbot de artistas.
 *
 * Inclui:
 * - POST /api/chatbot/artist-info — Envia pergunta sobre um artista específico
 *
 * Requer:
 * - Validação Joi dos dados recebidos
 */

const express = require("express");
const router = express.Router();

const validate = require("../middleware/validate");
const { askArtistQuestionSchema } = require("../validators/chatbotArtist");
const {
    getArtistInfoFromAI,
} = require("../controllers/chatbotArtistController");

/**
 * @route POST /api/chatbot/artist-info
 * @description Recebe o nome do artista e uma pergunta, responde com texto da IA.
 * @access Público
 */
router.post(
    "/artist-info",
    validate(askArtistQuestionSchema, "body"),
    getArtistInfoFromAI
);

module.exports = router;
