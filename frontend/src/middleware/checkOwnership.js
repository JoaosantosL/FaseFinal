/**
 * @file checkOwnership.js
 * @description
 * Middleware que verifica se o recurso (playlist, biblioteca, etc.)
 * pertence ao utilizador autenticado.
 *
 * Evita que um utilizador altere ou remova dados que pertencem a outra pessoa.
 *
 * Exemplo de uso:
 *   router.patch("/users/:id/playlists/:playlistId",
 *     verifyToken,
 *     checkOwnership(Playlist, "playlistId", "user"),
 *     ctrl.editPlaylist
 *   );
 */

const AppError = require("../utils/appError");

/**
 * Gera um middleware que verifica se o recurso consultado pertence ao utilizador autenticado.
 *
 * @param {import('mongoose').Model} Model - Modelo Mongoose a utilizar (ex: Playlist, Library)
 * @param {string} [param='id'] - Nome do parâmetro na rota que contém o ID do recurso (ex: 'playlistId')
 * @param {string} [ownerField='user'] - Nome do campo que indica o proprietário (ex: 'user' ou 'owner')
 * @returns {Function} Middleware Express
 *
 * Este middleware assume que `verifyToken` já foi executado antes,
 * ou seja, que `req.user` está preenchido.
 */
function checkOwnership(Model, param = "id", ownerField = "user") {
    return async (req, res, next) => {
        // 1. Procura o documento com apenas o campo do dono
        const doc = await Model.findById(req.params[param]).select(ownerField);

        // 2. Se não existir, devolve erro 404
        if (!doc) {
            return next(new AppError("Recurso não encontrado", 404));
        }

        // 3. Se o utilizador autenticado não for o dono, devolve 403
        if (doc[ownerField].toString() !== req.user.id) {
            return next(new AppError("Acesso proibido", 403));
        }

        // 4. Dono confirmado → segue para o próximo middleware/controlador
        next();
    };
}

module.exports = checkOwnership;
