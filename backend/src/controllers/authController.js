/**
 * @file authController.js
 * @description
 * Controladores responsáveis pela autenticação de utilizadores.
 *
 * Funções implementadas:
 * - Registo (criação de novo utilizador)
 * - Login (autenticação com email e password)
 * - Logout (limpeza do cookie JWT)
 * - /me (verificação da sessão autenticada)
 *
 * Autenticação feita com JWT em cookie HttpOnly:
 *  - Seguro contra ataques XSS
 *  - Com política SameSite e duração configurável
 */

const jwt = require("jsonwebtoken"); // Geração e verificação de tokens JWT
const bcrypt = require("bcrypt"); // Hashing seguro de passwords
const User = require("../models/User"); // Modelo Mongoose para utilizadores

const catchAsync = require("../utils/catchAsync"); // Wrapper para tratar erros async
const sanitize = require("../utils/sanitize"); // Limpeza de campos para prevenir XSS
const AppError = require("../utils/appError"); // Classe de erro personalizada para erros HTTP
const logger = require("../utils/logger"); // Logger para registos de eventos

// ─────────────────────────────────────────────────────────────
// Auxiliar: gera um JWT com o ID do utilizador autenticado
// ─────────────────────────────────────────────────────────────

/**
 * Gera um token JWT contendo o ID do utilizador.
 * @param {string} userId - O ID MongoDB do utilizador
 * @returns {string} - Token JWT assinado
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "2d",
    });
};

// ─────────────────────────────────────────────────────────────
// Configurações para o cookie onde será guardado o token
// ─────────────────────────────────────────────────────────────

/**
 * Devolve as opções corretas para o cookie JWT,
 * incluindo SameSite e segurança adaptada ao ambiente.
 *
 * @returns {Object} - Objeto de configuração para `res.cookie`
 */
const getCookieOptions = () => {
    const sameSite = process.env.SAMESITE_POLICY || "lax";
    return {
        httpOnly: true, // Impede acesso via JavaScript (proteção XSS)
        secure: sameSite === "none", // Obrigatório em ambientes com SameSite=None (HTTPS)
        sameSite, // Pode ser "strict", "lax" ou "none"
        maxAge: 1000 * 60 * 60 * 48, // 48h (em milissegundos)
    };
};

// ─────────────────────────────────────────────────────────────
// REGISTO
// ─────────────────────────────────────────────────────────────

/**
 * Regista um novo utilizador (normal ou artista).
 * - Se `role === "artist"`, cria também um perfil Artist e liga via `linkedArtist`
 * - Verifica duplicação
 * - Hasheia a password
 * - Gera JWT e envia via cookie
 *
 * @route POST /api/auth/register
 * @access Público
 */
const Artist = require("../models/Artist"); // Importar modelo Artist


const register = catchAsync(async (req, res) => {
    const username = sanitize(req.body.username);
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role || "base";

    // Apenas se for premium
    const artistName = req.body.artistName
        ? sanitize(req.body.artistName)
        : null;

    // Novo campo opcional: se o artista é português
    const isPortuguese = req.body.isPortuguese === true;

    // Verifica duplicação de email ou username
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
        throw new AppError("Email ou username já em uso", 409);
    }

    // Hasheia a password
    const passwordHash = await bcrypt.hash(password, 10);

    // Se for premium, cria o documento Artist com o nome e nacionalidade
    let linkedArtistId = null;
    if (role === "premium") {
        const artist = await Artist.create({
            name: artistName,
            isPortuguese,
            isPublic: false,
        });
        linkedArtistId = artist._id;
    }

    // Criação do utilizador
    const user = await User.create({
        username,
        email,
        passwordHash,
        role,
        linkedArtist: linkedArtistId,
    });

    // Geração de JWT e envio no cookie
    const token = generateToken(user._id);
    res.cookie("token", token, getCookieOptions());

    logger.info(`Novo registo: ${email} (${role})`);

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            linkedArtist: user.linkedArtist,
        },
    });
});



// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────

/**
 * Autentica um utilizador existente.
 * - Verifica email e password
 * - Se válido, gera JWT e envia cookie
 *
 * @route POST /api/auth/login
 * @access Público
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const validPassword =
        user && (await bcrypt.compare(password, user.passwordHash));

    if (!validPassword) {
        throw new AppError("Credenciais inválidas", 401);
    }

    const token = generateToken(user._id);
    res.cookie("token", token, getCookieOptions());

    res.json({
        success: true,
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            linkedArtist: user.linkedArtist,
        },
    });
});

// ─────────────────────────────────────────────────────────────
// ME
// ─────────────────────────────────────────────────────────────

/**
 * Devolve os dados do utilizador autenticado.
 * - A autenticação já foi validada pelo middleware `verifyToken`
 * - `req.user` contém o utilizador autenticado
 *
 * @route GET /api/auth/me
 * @access Privado
 */
const me = (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
};

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────

/**
 * Termina a sessão do utilizador.
 * - Limpa o cookie JWT
 *
 * @route POST /api/auth/logout
 * @access Público
 */
const logout = (req, res) => {
    res.clearCookie("token", {
        ...getCookieOptions(),
        expires: new Date(0), // Expira imediatamente
    });

    res.json({
        success: true,
        message: "Sessão terminada com sucesso",
    });
};

// Exportação dos controladores
module.exports = {
    register,
    login,
    me,
    logout,
};
