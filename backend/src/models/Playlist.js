/**
 * @file Playlist.js
 * @description
 * Modelo Mongoose para playlists privadas dos utilizadores na aplicação SoundDream.
 *
 * Cada playlist:
 * - é criada por um utilizador (campo `user`)
 * - contém uma lista ordenada de músicas (`musics`)
 * - suporta soft-delete com `isDeleted` e `deletedAt`
 *
 * O modelo usa `timestamps: true` para registar automaticamente as datas
 * de criação e de última atualização.
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// Schema principal da playlist
// ─────────────────────────────────────────────

const playlistSchema = new mongoose.Schema(
    {
        /**
         * Nome da playlist (ex: "Estudo", "Favoritas").
         * Campo obrigatório e com trim automático.
         */
        name: {
            type: String,
            required: [true, "O nome da playlist é obrigatório"],
            trim: true,
        },

        /**
         * Referência ao utilizador que criou a playlist.
         * Um utilizador pode ter várias playlists.
         */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        /**
         * Lista de músicas incluídas nesta playlist.
         * A ordem do array define a ordem de reprodução.
         */
        musics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Music",
            },
        ],

        // ───────────── Soft-delete ──────────────

        /**
         * Indica se a playlist foi marcada como eliminada.
         */
        isDeleted: {
            type: Boolean,
            default: false,
            select: false, // oculto nas queries por defeito
        },

        /**
         * Data e hora em que foi eliminada logicamente.
         */
        deletedAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true, // adiciona createdAt e updatedAt
    }
);

// Exporta o modelo Playlist
module.exports = mongoose.model("Playlist", playlistSchema);
