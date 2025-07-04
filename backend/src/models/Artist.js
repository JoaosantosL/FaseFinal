/**
 * @file Artist.js
 * @description
 * Modelo Mongoose que representa um artista musical na aplicação SoundDream.
 *
 * Cada artista:
 * - tem um nome e uma biografia
 * - pode ter uma imagem de perfil
 * - pode estar associado a vários álbuns (relação 1:N)
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────
// Definição do schema do artista
// ─────────────────────────────────────────────────────
const artistSchema = new mongoose.Schema(
    {
        /**
         * Nome artístico (ex: "Adele", "Coldplay").
         * Campo obrigatório. O `trim` remove espaços antes/depois do nome.
         */
        name: {
            type: String,
            required: true,
            trim: true,
        },

        /**
         * Biografia (campo opcional).
         * Pode conter HTML, por isso é sanitizado no controlador para evitar XSS.
         */
        bio: {
            type: String,
        },

        /**
         * Indica se o artista é português (destaque nacional).
         */
        isPortuguese: {
            type: Boolean,
            default: false,
        },
        /**
         * URL da imagem de perfil.
         * Pode ser um link externo (CDN) ou caminho local (relativo).
         */
        imageUrl: {
            type: String,
        },

        /**
         * Lista de álbuns associados a este artista.
         * Cada entrada é o ID de um documento da coleção "Album".
         * Usado com `.populate("albums")` no controlador.
         */
        albums: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Album",
            },
        ],
    },
    {
        // Ativa timestamps automáticos:
        // - createdAt: quando foi criado
        // - updatedAt: última atualização
        timestamps: true,
    }
);

// ─────────────────────────────────────────────────────
// Exporta o modelo Artist com base no schema definido
// ─────────────────────────────────────────────────────
module.exports = mongoose.model("Artist", artistSchema);