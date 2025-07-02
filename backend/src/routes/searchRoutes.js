/**
 * @file searchRoutes.js
 * @description
 * Define a rota de pesquisa global (músicas, artistas, álbuns).
 * Endpoint: GET /api/search?q=...
 */

const express = require("express");
const router = express.Router();

// Controlador com a lógica da pesquisa
const { globalSearch } = require("../controllers/searchController");

// ─────────────────────────────────────────────────────────────
// Rota: GET /api/search?q=levitating
// Pesquisa em músicas (title), artistas (name) e álbuns (title)
// ─────────────────────────────────────────────────────────────
router.get("/", globalSearch);

module.exports = router;
