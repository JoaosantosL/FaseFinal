/**
 * @file recommendationUtils.js
 * @description
 * Utilitários relacionados com recomendações musicais.
 *
 * Este módulo contém funções que constroem perfis de utilizadores
 * com base em interações com músicas:
 * - Likes (+3)
 * - Biblioteca pessoal (+2)
 * - Reproduções frequentes (≥ 5 vezes → +1)
 *
 * Estes perfis podem depois ser usados para gerar recomendações
 * com base em similaridade entre utilizadores ou músicas.
 *
 * @module utils/recommendationUtils
 */

const User = require("../models/User");
const Music = require("../models/Music");

/**
 * Calcula o "perfil musical" de um utilizador, atribuindo pesos às músicas
 * com base nas suas interações: likes, biblioteca e reproduções.
 *
 * @param {string} userId - ID do utilizador autenticado
 * @returns {Promise<Object>} - Objeto com IDs de músicas como chaves e pesos como valores
 *
 * Exemplo de retorno:
 * {
 *   "665f123abc...": 5,   // liked (3) + biblioteca (2)
 *   "665f456def...": 1    // ouviu ≥ 5 vezes
 * }
 */
async function getUserMusicProfile(userId) {
    // Obtém o utilizador com biblioteca e personalPlays
    const user = await User.findById(userId)
        .select("library personalPlays")
        .lean();

    if (!user) return {};

    const profile = {};

    // Biblioteca pessoal → +2 pontos por música
    user.library.forEach((musicId) => {
        const id = musicId.toString();
        profile[id] = (profile[id] || 0) + 2;
    });

    // Reproduções com contagem ≥ 5 → +1 ponto
    user.personalPlays.forEach((play) => {
        if (play.count >= 5) {
            const id = play.music.toString();
            profile[id] = (profile[id] || 0) + 1;
        }
    });

    // Likes do utilizador → +3 pontos
    // Consulta inversa: procurar músicas que contenham o userId no array likes
    const likedMusics = await Music.find({ likes: userId })
        .select("_id")
        .lean();

    likedMusics.forEach((music) => {
        const id = music._id.toString();
        profile[id] = (profile[id] || 0) + 3;
    });

    return profile;
}

module.exports = {
    getUserMusicProfile,
};
