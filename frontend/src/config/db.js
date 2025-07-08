/**
 * @file db.js
 * @description
 * Estabelece a ligação à base de dados MongoDB utilizando Mongoose.
 *
 * Também permite sincronizar os índices definidos nos modelos (opcional),
 * garantindo que os índices definidos nos schemas são aplicados na base de dados.
 *
 * A sincronização é ativada colocando SYNC_INDEXES=true no ficheiro .env
 */

const mongoose = require("mongoose");
const logger = require("../utils/logger");

// ─── Modelos usados para sincronizar os índices ───
const User = require("../models/User");
const Music = require("../models/Music");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Playlist = require("../models/Playlist");

/**
 * @async
 * @function connectDB
 * @description
 * Liga-se à base de dados MongoDB e (opcionalmente) sincroniza os índices dos modelos.
 *
 * Se SYNC_INDEXES=true estiver definido nas variáveis de ambiente,
 * executa syncIndexes() em cada modelo, para forçar a criação dos índices no MongoDB.
 *
 * Em caso de erro, regista no log e encerra a aplicação.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // 1️⃣ Estabelece ligação com a base de dados
        await mongoose.connect(process.env.DB_URI);
        logger.info("Ligação à base de dados MongoDB estabelecida");

        // 2️⃣ Sincroniza os índices (se ativado via .env)
        if (process.env.SYNC_INDEXES === "true") {
            await Promise.all([
                User.syncIndexes(),
                Music.syncIndexes(),
                Artist.syncIndexes(),
                Album.syncIndexes(),
                Playlist.syncIndexes(),
            ]);
            logger.info("Índices sincronizados com sucesso");
        } else {
            logger.info(
                "Sincronização de índices desativada (SYNC_INDEXES=false)"
            );
        }
    } catch (err) {
        // 3️⃣ Em caso de erro, regista e termina a aplicação com erro
        logger.error("Erro ao conectar à base de dados:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
