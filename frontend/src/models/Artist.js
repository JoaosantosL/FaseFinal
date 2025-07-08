/**
 * @file Artist.js
 * @description
 * Modelo Mongoose que representa um artista musical na aplicação SoundDream.
 *
 * Cada artista:
 * - tem um nome e uma biografia
 * - pode ter uma imagem de perfil
 * - pode estar associado a vários álbuns
 * - pode incluir dados biográficos avançados para o chatbot
 */

const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
        },
        isPortuguese: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            type: String,
        },
        albums: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Album",
            },
        ],

        /**
         * Texto livre com o percurso artístico do artista.
         * Pode incluir formação, prémios, colaborações, etc.
         */
        percurso: {
            type: String,
        },

        /**
         * Lista de influências musicais (strings curtas, ex: "Fado", "Jazz", "Eletrónica").
         */
        influences: [
            {
                type: String,
                trim: true,
                maxlength: 100,
            },
        ],

        /**
         * Indica se o perfil do artista é público ou privado.
         * - Público: visível para todos os utilizadores
         * - Privado: apenas visível para o próprio user artista
         */
        isPublic: {
            type: Boolean,
            default: false, // Começa como privado
        },

        /**
         * Factos ou curiosidades sobre o artista.
         * Ex: "Vencedor do Festival da Canção 2022", "Colaborou com Rui Veloso".
         */
        facts: [
            {
                type: String,
                trim: true,
                maxlength: 300,
            },
        ],

        /**
         * Informação adicional invisível no perfil,
         * usada apenas para alimentar a IA com mais contexto.
         */
        extraInfo: {
            type: String,
            trim: true,
            maxlength: 3000,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Artist", artistSchema);
