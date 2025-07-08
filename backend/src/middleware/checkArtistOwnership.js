/**
 * @file checkArtistOwnership.js
 * @description
 * Middleware que verifica se o artista a ser editado pertence ao utilizador autenticado.
 *
 * O utilizador só pode editar o seu próprio perfil artístico (linkedArtist).
 *
 * Requisitos:
 * - O utilizador tem de estar autenticado (`verifyToken`)
 * - Tem de ter um campo `linkedArtist` que corresponda ao ID pedido
 */

const Artist = require("../models/Artist");
const AppError = require("../utils/appError");

/**
 * Middleware que verifica se o utilizador autenticado é dono do perfil artístico.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
const checkArtistOwnership = async (req, res, next) => {
    const artistId = req.params.id;

    // 1. Garante que o utilizador tem um artista associado
    if (!req.user.linkedArtist) {
        return next(
            new AppError("Não tens um perfil artístico associado.", 403)
        );
    }

    // 2. Verifica se o ID recebido corresponde ao artist associado ao user
    if (req.user.linkedArtist.toString() !== artistId) {
        return next(
            new AppError(
                "Acesso proibido: não és dono deste perfil artístico.",
                403
            )
        );
    }

    // 3. Verifica se o artista existe
    const artistExists = await Artist.exists({ _id: artistId });
    if (!artistExists) {
        return next(new AppError("Artista não encontrado.", 404));
    }

    // Dono confirmado → continua
    next();
};

module.exports = checkArtistOwnership;
