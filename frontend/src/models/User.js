/**
 * @file User.js
 * @description
 * Modelo Mongoose que representa os utilizadores da aplicação SoundDream.
 *
 * Cada utilizador tem:
 * - Dados de autenticação (username, email, passwordHash)
 * - Biblioteca pessoal (`library`)
 * - Reproduções pessoais com estatísticas (`personalPlays`)
 * - Papel na aplicação: "user" ou "artist"
 * - Se for artista, pode estar associado a um perfil público (`linkedArtist`)
 *
 * Utiliza timestamps automáticos (createdAt, updatedAt).
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "O nome de utilizador é obrigatório"],
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            required: [true, "O email é obrigatório"],
            lowercase: true,
            unique: true,
        },
        passwordHash: {
            type: String,
            required: [true, "A password é obrigatória"],
        },
        role: {
            type: String,
            enum: ["base", "pro", "artist"], 
            default: "base",
        },
        library: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Music",
            },
        ],
        personalPlays: [
            {
                music: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Music",
                    required: true,
                },
                count: {
                    type: Number,
                    default: 1,
                },
                lastPlayedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        /**
         * Se o utilizador for artista, este campo liga-o ao seu perfil público.
         * Ex: user "ritasilva" → Artist "Rita Silva"
         */
        linkedArtist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
