/**
 * @file recommendationUtils.js
 * @description
 * Utilitários relacionados com recomendações musicais.
 *
 * Este módulo constrói perfis musicais personalizados para cada utilizador,
 * com base em interações como:
 * - Likes
 * - Biblioteca pessoal
 * - Reproduções frequentes
 *
 * Os pesos aplicados são definidos externamente no ficheiro de configuração.
 *
 * @module utils/recommendationUtils
 */

const User = require("../models/User");
const Music = require("../models/Music");
const config = require("../config/recommendation");

/**
 * @function getUserMusicProfile
 * @description
 * Calcula o perfil musical de um utilizador, atribuindo pesos às músicas com base
 * em interações (likes, biblioteca, reproduções).
 *
 * Retorna:
 * - `profile`: objeto { musicId: peso }
 * - `knownMusicIds`: Set com todos os IDs de músicas interagidas, útil para exclusão
 *
 * @param {string} userId - ID do utilizador autenticado
 * @returns {Promise<{ profile: Object, knownMusicIds: Set<string> }>}
 */
async function getUserMusicProfile(userId) {
    const user = await User.findById(userId)
        .select("library personalPlays")
        .lean();

    if (!user) return { profile: {}, knownMusicIds: new Set() };

    const profile = {};
    const knownMusicIds = new Set();

    // Biblioteca pessoal → peso definido por config
    user.library.forEach((musicId) => {
        const id = musicId.toString();
        profile[id] = (profile[id] || 0) + config.WEIGHTS.library;
        knownMusicIds.add(id);
    });

    // Reproduções frequentes (≥ config.MIN_PLAY_THRESHOLD)
    user.personalPlays.forEach((play) => {
        if (play.count >= config.MIN_PLAY_THRESHOLD) {
            const id = play.music.toString();
            profile[id] = (profile[id] || 0) + config.WEIGHTS.play;
            knownMusicIds.add(id);
        }
    });

    // Likes do utilizador → peso definido por config
    const likedMusics = await Music.find({ likes: userId })
        .select("_id")
        .lean();

    likedMusics.forEach((music) => {
        const id = music._id.toString();
        profile[id] = (profile[id] || 0) + config.WEIGHTS.like;
        knownMusicIds.add(id);
    });

    return { profile, knownMusicIds };
}

module.exports = {
    getUserMusicProfile,
};
