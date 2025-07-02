/**
 * @file musicRoutes.js
 * @description
 * Define as rotas para acesso ao repositório global de músicas.
 *
 * Estas rotas permitem:
 * - Listar todas as músicas disponíveis
 * - Obter os detalhes de uma música
 * - Registar uma reprodução (play)
 * - Registar uma reação (fire / love)
 *
 * Proteções implementadas:
 * - `verifyToken` (JWT via cookie) → para reações
 * - `validate` com Joi → validação de parâmetros e corpo
 * - `playLimiter` / `reactionLimiter` → previne abuso (rate-limit por IP)
 */

const express = require("express");
const router = express.Router();

// ─────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────

const verifyToken = require("../middleware/verifyToken"); // JWT via cookie
const validate = require("../middleware/validate"); // Validação com Joi
const playLimiter = require("../middleware/playLimiter"); // Limita plays por IP
const reactionLimiter = require("../middleware/reactionLimiter"); // Limita reações por IP

// Schemas Joi usados para validar os parâmetros e o corpo
const { idSchema } = require("../validators/id");
const { reactionSchema } = require("../validators/music");

// Controladores com a lógica de cada rota
const {
    getAllMusic,
    registerPlay,
    getMusicById,
    reactToMusic,
    likeMusic,
    unlikeMusic,
} = require("../controllers/musicController");

// ─────────────────────────────────────────────────────
// GET /api/music
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/music
 * @description Devolve a lista de todas as músicas disponíveis
 * @access Privado (requer JWT)
 */
router.get("/", verifyToken, getAllMusic);

// ─────────────────────────────────────────────────────
// POST /api/music/:id/play
// ─────────────────────────────────────────────────────

/**
 * @route POST /api/music/:id/play
 * @description Regista a reprodução de uma música (incrementa contador)
 * @access Público (com rate-limit)
 *
 * Middlewares aplicados:
 * - `verifyToken` (opcional: se o user estiver autenticado, guarda também na estatística pessoal)
 * - `validate(idSchema)` → garante que o ID da música é válido
 * - `playLimiter` → evita spam (ex: 50 chamadas por minuto)
 */
router.post(
    "/:id/play",
    verifyToken,
    validate(idSchema, "params"),
    playLimiter,
    registerPlay
);

// ─────────────────────────────────────────────────────
// GET /api/music/:id
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/music/:id
 * @description Devolve os detalhes completos de uma música
 * @access Privado (requer JWT)
 *
 * Exemplo: título, artista, álbum, URL da capa e do áudio
 */
router.get("/:id", verifyToken, validate(idSchema, "params"), getMusicById);

// ─────────────────────────────────────────────────────
// POST /api/music/:id/like
// ─────────────────────────────────────────────────────
/**
 * @route POST /api/music/:id/like
 * @description Regista que o utilizador gosta de uma música (like)
 * @access Privado (requer JWT)
 *
 * Middlewares aplicados:
 * - `verifyToken` → obriga autenticação
 * - `validate(idSchema, "params")` → valida o ID da música no URL
 */
router.post("/:id/like", verifyToken, validate(idSchema, "params"), likeMusic);

// ─────────────────────────────────────────────────────
// DELETE /api/music/:id/like
// ─────────────────────────────────────────────────────
/**
 * @route DELETE /api/music/:id/like
 * @description Remove o like de uma música pelo utilizador
 * @access Privado (requer JWT)
 *
 * Middlewares aplicados:
 * - `verifyToken` → obriga autenticação
 * - `validate(idSchema, "params")` → valida o ID da música no URL
 */
router.delete(
    "/:id/like",
    verifyToken,
    validate(idSchema, "params"),
    unlikeMusic
);

// ─────────────────────────────────────────────────────
// POST /api/music/:id/react
// ─────────────────────────────────────────────────────

/**
 * @route POST /api/music/:id/react
 * @description Regista uma reação (❤️ ou 🔥) à música
 * @access Privado (requer JWT)
 *
 * Middlewares aplicados:
 * - `verifyToken` → obriga autenticação
 * - `reactionLimiter` → limita 20 reações por minuto por IP
 * - `validate(reactionSchema)` → valida o campo reaction no body
 */
router.post(
    "/:id/react",
    verifyToken,
    reactionLimiter,
    validate(reactionSchema),
    reactToMusic
);

// Exporta o router para uso em app.js
module.exports = router;
