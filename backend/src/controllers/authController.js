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
const { registerSchema } = require("../validators/auth");

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

const register = catchAsync(async (req, res, next) => {
    const { username, email, password, role, artistName, isPortuguese } = req.body;

    // 1. Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email já está em uso', 400));
    }

    // 2. Criar o usuário base
    const newUser = await User.create({
        username: sanitize(username),
        email: sanitize(email),
        passwordHash: password, // Será hasheado pelo pre-save hook
        role: role || 'base'
    });

    let artistProfile = null;
    
    // 3. Se for artista, criar registro na coleção Artist
    if (role === 'artist') {
        if (!artistName) {
            return next(new AppError('Nome artístico é obrigatório para artistas', 400));
        }

        artistProfile = await Artist.create({
            name: sanitize(artistName),
            isPortuguese: isPortuguese || false,
            // Campos padrão para novo artista
            isPublic: false,
            bio: `Artista ${artistName} na plataforma SoundDream`
        });

        // Atualizar o usuário com a referência ao artista
        newUser.linkedArtist = artistProfile._id;
        await newUser.save();
    }

    // 4. Gerar token JWT
    const token = generateToken(newUser._id);

    // 5. Configurar cookie seguro
    res.cookie('token', token, getCookieOptions());

    // 6. Preparar resposta
    const responseData = {
        user: {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
            linkedArtist: newUser.linkedArtist || null
        }
    };

    if (artistProfile) {
        responseData.artist = {
            _id: artistProfile._id,
            name: artistProfile.name,
            isPortuguese: artistProfile.isPortuguese
        };
    }

    res.status(201).json({
        success: true,
        data: responseData
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
