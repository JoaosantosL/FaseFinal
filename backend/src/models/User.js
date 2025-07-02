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
 *
 * Utiliza timestamps automáticos (createdAt, updatedAt).
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// Schema principal do utilizador
// ─────────────────────────────────────────────

const userSchema = new mongoose.Schema(
    {
        /**
         * Nome de utilizador (ex: "joaosantos").
         * Único na base de dados.
         */
        username: {
            type: String,
            required: [true, "O nome de utilizador é obrigatório"],
            trim: true,
            unique: true,
        },

        /**
         * Email do utilizador.
         * Usado para login e comunicação.
         */
        email: {
            type: String,
            required: [true, "O email é obrigatório"],
            lowercase: true,
            unique: true,
        },

        /**
         * Hash da password (não se guarda a password original por segurança).
         * É gerado com bcrypt no momento de registo.
         */
        passwordHash: {
            type: String,
            required: [true, "A password é obrigatória"],
        },

        /**
         * Papel do utilizador (user ou artist).
         * Os administradores serão definidos futuramente.
         */
        role: {
            type: String,
            enum: ["user", "artist"],
            default: "user",
        },

        /**
         * Biblioteca pessoal do utilizador.
         * Contém referências às músicas favoritas/guardadas.
         */
        library: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Music",
            },
        ],

        /**
         * Estatísticas de reproduções pessoais.
         * Cada entrada tem:
         * - `music`: referência à música ouvida
         * - `count`: número de vezes que ouviu
         * - `lastPlayedAt`: data da última reprodução
         */
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
    },
    {
        // Adiciona automaticamente createdAt e updatedAt
        timestamps: true,
    }
);

// Exporta o modelo User
module.exports = mongoose.model("User", userSchema);
