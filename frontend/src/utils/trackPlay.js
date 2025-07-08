/**
 * @file trackPlay.js
 * @description
 * Função utilitária para registar a reprodução de uma música por um utilizador.
 *
 * Este módulo atualiza o campo `personalPlays` do modelo User:
 * - Se a música já foi ouvida antes, incrementa o contador e atualiza o timestamp
 * - Se for a primeira vez, adiciona uma nova entrada com count = 1
 *
 * Esta função é usada pelo controlador de reprodução para manter estatísticas individuais
 *
 * @module utils/trackPlay
 */

const User = require("../models/User");

/**
 * Regista a reprodução de uma música por um utilizador.
 *
 * @param {string} userId - ID do utilizador autenticado (ObjectId como string)
 * @param {string} musicId - ID da música reproduzida (ObjectId como string)
 * @returns {Promise<void>}
 */
async function trackPlay(userId, musicId) {
    // Obtém o utilizador pela base de dados
    const user = await User.findById(userId);

    if (!user) return; // Caso raro: utilizador não encontrado

    // Verifica se já existe entrada para esta música no campo personalPlays
    const existingEntry = user.personalPlays.find(
        (p) => p.music.toString() === musicId.toString()
    );

    if (existingEntry) {
        // Se já ouviu antes → incrementa o contador
        existingEntry.count += 1;
        existingEntry.lastPlayedAt = new Date(); // Atualiza a data
    } else {
        // Se for a primeira vez → adiciona nova entrada ao array
        user.personalPlays.push({
            music: musicId,
            count: 1,
            lastPlayedAt: new Date(),
        });
    }

    // 5️⃣ Guarda as alterações no documento
    await user.save();
}

module.exports = trackPlay;
