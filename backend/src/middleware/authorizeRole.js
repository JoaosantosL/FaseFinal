/**
 * @file authorizeRole.js
 * @description
 * Middleware de controlo de acesso baseado em papéis (roles).
 *
 * Permite restringir o acesso a determinadas rotas conforme o papel do utilizador:
 * - "user": utilizador normal
 * - "artist": criador de conteúdo
 * - "admin": administrador com permissões elevadas
 *
 * Exemplo de uso:
 *   router.post("/admin",
 *     verifyToken,               // Verifica que está autenticado
 *     authorizeRole("admin"),    // Verifica que tem papel de admin
 *     ctrl.restrito              // Função que só admins podem aceder
 *   );
 */

const AppError = require("../utils/appError");

/**
 * Gera um middleware que só permite acesso se o utilizador tiver um dos papéis autorizados.
 *
 * @param {...string} roles - Lista de papéis permitidos (ex: 'admin', 'artist')
 * @returns {Function} Middleware Express
 *
 * Este middleware assume que `req.user` foi definido previamente por `verifyToken`.
 */
function authorizeRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("Não autorizado a aceder a esta rota", 403)
            );
        }
        next();
    };
}

module.exports = authorizeRole;
