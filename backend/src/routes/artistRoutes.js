/**
 * @file artistRoutes.js
 * @description
 * Define as rotas públicas para leitura de Artistas e Álbuns na aplicação SoundDream.
 *
 * Todas as rotas deste ficheiro são abertas (não requerem login).
 * Utilizam validação com Joi para garantir que os IDs têm o formato correto (24 caracteres hexadecimais).
 */

const express = require("express");
const router = express.Router();

// ─────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────

const validate = require("../middleware/validate"); // valida parâmetros com Joi
const { idSchema } = require("../validators/id"); // schema de validação para ObjectId (24 hex)

// ─────────────────────────────────────────────────────
// Controladores (funções que executam a lógica)
// ─────────────────────────────────────────────────────

const {
    getAllArtists,
    getArtistById,
    getAlbumById,
} = require("../controllers/artistController");

// ─────────────────────────────────────────────────────
// Rota: GET /api/artists
// Descrição: Lista todos os artistas registados
// Não tem parâmetros nem requer autenticação
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/artists
 * @desc Devolve lista de todos os artistas registados
 * @access Público
 */
router.get("/artists", getAllArtists);

// ─────────────────────────────────────────────────────
// Rota: GET /api/artists/:id
// Descrição: Detalhes de um artista (inclui os seus álbuns)
// Validação com Joi assegura que o ID é válido
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/artists/:id
 * @desc Devolve detalhes de um artista específico (e seus álbuns)
 * @access Público
 */
router.get("/artists/:id", validate(idSchema, "params"), getArtistById);

// ─────────────────────────────────────────────────────
// Rota: GET /api/albums/:id
// Descrição: Detalhes de um álbum (e músicas associadas)
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/albums/:id
 * @desc Devolve um álbum e a lista de músicas que o compõem
 * @access Público
 */
router.get("/albums/:id", validate(idSchema, "params"), getAlbumById);

// Exporta o router para ser usado em app.js
module.exports = router;
