/**
 * @file recommendationRoutes.js
 * @description
 * Define as rotas relacionadas com recomendações musicais personalizadas.
 *
 * Inclui:
 * - `GET /api/recommendation/me` — Sugestões com base nos likes, biblioteca e reproduções
 *
 * Requer utilizador autenticado (`verifyToken`)
 */

const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const {
    getRecommendationsForUser,
} = require("../controllers/recommendationController");

/**
 * @route GET /api/recommendation/me
 * @description Devolve 3 músicas recomendadas ao utilizador autenticado
 * @access Privado (JWT necessário no cookie)
 */
router.get("/me", verifyToken, getRecommendationsForUser);

module.exports = router;
