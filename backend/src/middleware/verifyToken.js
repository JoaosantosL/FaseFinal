/**
 * @file verifyToken.js
 * @description
 * Middleware de autenticação baseado em JWT (JSON Web Token).
 *
 * Este middleware verifica se o utilizador está autenticado,
 * lendo o token JWT guardado num cookie HttpOnly.
 *
 * Se o token for válido:
 *   - Recupera o utilizador correspondente da base de dados
 *   - Injeta os dados do utilizador em `req.user`
 *   - Permite o acesso à rota protegida
 *
 * Caso contrário:
 *   - Bloqueia o acesso com erro 401 (Não autenticado)
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware Express que verifica se o pedido está autenticado.
 *
 * Este middleware deve ser usado em rotas protegidas (como biblioteca,
 * playlists, etc). Ele impede o acesso não autorizado a recursos privados.
 *
 * @param {Request} req - Objeto de pedido HTTP
 * @param {Response} res - Objeto de resposta HTTP
 * @param {Function} next - Função para passar ao próximo middleware
 */
const verifyToken = async (req, res, next) => {
    // 1. Lê o token guardado no cookie HttpOnly
    const token = req.cookies.token;

    // Se não existir, o utilizador não está autenticado
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Não autenticado",
            code: 401,
        });
    }

    try {
        // 2. Verifica se o token é válido e extrai o payload (ex: { id: "..." })
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Procura o utilizador correspondente ao ID guardado no token
        const user = await User.findById(decoded.id).select(
            "username email role"
        );

        // Se não existir (foi apagado ou inválido), bloqueia
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Utilizador não encontrado",
                code: 401,
            });
        }

        // 4. Associa os dados do utilizador à requisição (req.user)
        req.user = user;

        // Continua para o controlador ou próximo middleware
        next();
    } catch (err) {
        // O token pode estar corrompido ou expirado
        return res.status(401).json({
            success: false,
            error: "Token inválido",
            code: 401,
        });
    }
};

module.exports = verifyToken;
