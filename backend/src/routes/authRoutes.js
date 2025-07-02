/**
 * @file authRoutes.js
 * @description
 * Define as rotas relacionadas com autenticação do utilizador na aplicação SoundDream.
 *
 * Inclui:
 * - Registo (POST /register)
 * - Login (POST /login)
 * - Logout (POST /logout)
 * - Verificação de sessão ativa (/me)
 *
 * Utiliza:
 * - Validação com Joi (validate)
 * - Proteção contra abuso com rate-limiters
 * - Autenticação JWT com cookies HttpOnly
 */

const express = require("express");
const router = express.Router();

// ─────────────────────────────────────────────────────
// Controladores com a lógica de cada rota de autenticação
// ─────────────────────────────────────────────────────

const {
    register,
    login,
    me,
    logout,
} = require("../controllers/authController");

// ─────────────────────────────────────────────────────
// Middlewares utilizados:
// ─────────────────────────────────────────────────────

const verifyToken = require("../middleware/verifyToken"); // garante que o JWT é válido
const loginLimiter = require("../middleware/loginLimiter"); // limita tentativas de login por IP
const registerLimiter = require("../middleware/registerLimiter"); // limita tentativas de registo
const validate = require("../middleware/validate"); // valida dados recebidos no body

// Schemas Joi que definem as regras de validação
const { registerSchema, loginSchema } = require("../validators/auth");

// ─────────────────────────────────────────────────────
// ROTAS PÚBLICAS (não requerem autenticação)
// ─────────────────────────────────────────────────────

/**
 * @route POST /api/auth/register
 * @description Regista um novo utilizador
 * @body { username, email, password, role (opcional) }
 * @access Público
 *
 * Passos:
 * 1. Aplica o rate-limit para prevenir abuso
 * 2. Valida o corpo do pedido com Joi
 * 3. Executa o controlador `register`
 */
router.post(
    "/register",
    registerLimiter,
    validate(registerSchema, "body"),
    register
);

/**
 * @route POST /api/auth/login
 * @description Inicia sessão de um utilizador existente
 * @body { email, password }
 * @access Público
 *
 * Passos:
 * 1. Limita o número de tentativas (loginLimiter)
 * 2. Valida os dados recebidos (validate)
 * 3. Executa o controlador `login`, que gera o cookie JWT
 */
router.post("/login", loginLimiter, validate(loginSchema, "body"), login);

/**
 * @route POST /api/auth/logout
 * @description Termina a sessão do utilizador (apaga cookie JWT)
 * @access Público
 *
 * Nota: funciona mesmo que o utilizador não esteja autenticado,
 * pois o objetivo é apenas apagar o cookie.
 */
router.post("/logout", logout);

// ─────────────────────────────────────────────────────
// ROTA PROTEGIDA — requer JWT válido no cookie
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/auth/me
 * @description Devolve os dados do utilizador autenticado
 * @access Privado
 *
 * O middleware `verifyToken` valida o cookie e
 * injeta o utilizador no `req.user`.
 */
router.get("/me", verifyToken, me);

// Exporta o router para uso em app.js
module.exports = router;
