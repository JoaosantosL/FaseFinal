/**
 * @file Music.js
 * @description
 * Modelo Mongoose que representa uma faixa musical na aplicação SoundDream.
 *
 * Cada música:
 * - tem um título, duração e URLs de capa e áudio
 * - pertence obrigatoriamente a um artista
 * - pode estar associada a um álbum (opcional)
 * - suporta reações dos utilizadores ("fire" ou "love")
 * - regista o número de reproduções (plays)
 * - suporta soft-delete (isDeleted / deletedAt)
 *
 * Inclui índices simples (por título, artista, álbum) e composto (artista + título)
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// Subdocumento para armazenar reações dos utilizadores
// ─────────────────────────────────────────────

const reactionSchema = new mongoose.Schema(
    {
        /**
         * Utilizador que fez a reação (referência ao modelo User)
         */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        /**
         * Tipo de reação: apenas "fire" ou "love" são permitidos
         */
        type: {
            type: String,
            enum: ["fire", "love"],
            required: true,
        },

        /**
         * Momento em que a reação foi feita
         */
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false, // reações não precisam de ID próprio
    }
);

// ─────────────────────────────────────────────
// Schema principal da música
// ─────────────────────────────────────────────

const musicSchema = new mongoose.Schema(
    {
        /**
         * Título da faixa (ex: "Levitating", "Blinding Lights")
         */
        title: {
            type: String,
            required: true,
            trim: true,
            index: true, // para facilitar pesquisas
        },

        /**
         * Referência obrigatória ao artista
         */
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
            index: true,
        },

        /**
         * Álbum a que pertence (opcional)
         */
        album: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            index: true,
        },

        /**
         * Duração da música (em segundos)
         */
        duration: {
            type: Number,
            required: true,
        },

        /**
         * Link para a imagem de capa da música
         */
        coverUrl: {
            type: String,
            required: true,
        },

        /**
         * Link para o ficheiro de áudio (.mp3 ou outro)
         */
        audioUrl: {
            type: String,
            required: true,
        },

        /**
         * Contador total de reproduções desta faixa
         */
        plays: {
            type: Number,
            default: 0,
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isExclusive: {
            type: Boolean,
            default: false,
        },

        // ───────────── Soft-delete ──────────────

        /**
         * Indica se a música está marcada como eliminada
         */
        isDeleted: {
            type: Boolean,
            default: false,
            select: false, // omitido das queries por defeito
        },

        /**
         * Data em que a música foi marcada como eliminada
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

// Índice composto: útil para ordenação e filtros por artista + título
musicSchema.index({ artist: 1, title: 1 });

// Exporta o modelo Music
module.exports = mongoose.model("Music", musicSchema);
