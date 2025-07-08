/**
 * @file Album.js
 * @description
 * Modelo Mongoose que representa um álbum musical na aplicação SoundDream.
 *
 * Cada álbum:
 * - pertence a um artista
 * - tem uma imagem de capa
 * - pode ter várias músicas associadas
 *
 * Inclui também suporte a "soft-delete" e timestamps automáticos.
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────
// Definição do schema do álbum
// ─────────────────────────────────────────────────────
const albumSchema = new mongoose.Schema(
    {
        /**
         * Título do álbum (ex: "Thriller", "Divide", "Future Nostalgia").
         * Este campo é obrigatório.
         */
        title: {
            type: String,
            required: true,
        },

        /**
         * Artista a que este álbum pertence.
         * Refere-se ao _id de um documento da coleção "Artist".
         */
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
        },

        /**
         * URL da imagem de capa do álbum.
         * Normalmente um link para uma imagem (relativo ou absoluto).
         */
        coverUrl: {
            type: String,
            required: true,
        },

        /**
         * Data em que o álbum foi lançado.
         * Este campo é opcional.
         */
        releaseDate: {
            type: Date,
        },

        /**
         * Lista de músicas associadas a este álbum.
         * Cada entrada é um ObjectId que aponta para a coleção "Music".
         */
        musics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Music",
            },
        ],

        /**
         * Soft-delete:
         * Em vez de apagar o documento, marcamos como eliminado.
         * `isDeleted`: true se o álbum estiver apagado
         * `deletedAt`: data em que foi apagado
         *
         * Estes campos são ocultos por defeito nas queries (select: false).
         */
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
        deletedAt: {
            type: Date,
            select: false,
        },
    },
    {
        // Ativa timestamps automáticos:
        // - createdAt: quando foi criado
        // - updatedAt: última atualização
        timestamps: true,
    }
);

// ─────────────────────────────────────────────────────
// Exporta o modelo Album com base no schema definido
// ─────────────────────────────────────────────────────
module.exports = mongoose.model("Album", albumSchema);
