/**
 * @file recommendationController.js
 * @description
 * Controlador responsável por gerar recomendações musicais para o utilizador autenticado.
 *
 * A lógica baseia-se em:
 * - Similaridade entre utilizadores que interagem com as mesmas músicas (cosine similarity)
 * - Pesos personalizados do perfil (likes, biblioteca, reproduções)
 * - Fallback para músicas populares, caso o perfil do utilizador seja insuficiente
 */

const Music = require("../models/Music");
const User = require("../models/User");
const { getUserMusicProfile } = require("../utils/recommendationUtils");
const logger = require("../utils/logger");
const config = require("../config/recommendation");

/**
 * Constrói um mapa musicId → Set<userIds> com base em múltiplos sinais:
 * - likes
 * - biblioteca pessoal
 * - reproduções frequentes
 *
 * Isto permite enriquecer a matriz de similaridade com mais interações reais.
 *
 * @param {Array} musics - Lista de músicas (com campo `likes`)
 * @param {Array} users - Lista de utilizadores (com `library`, `personalPlays`)
 * @returns {Map<string, Set<string>>} - Mapa musicId → Set de utilizadores
 */
function buildMusicUserMapExpanded(musics, users) {
    const map = new Map();

    // Likes por música
    for (const music of musics) {
        const id = music._id.toString();
        if (!map.has(id)) map.set(id, new Set());

        const userSet = map.get(id);
        (music.likes || []).forEach((u) => userSet.add(u.toString()));
    }

    // Biblioteca e plays frequentes por utilizador
    for (const user of users) {
        const uid = user._id.toString();

        (user.library || []).forEach((mid) => {
            const musicId = mid.toString();
            if (!map.has(musicId)) map.set(musicId, new Set());
            map.get(musicId).add(uid);
        });

        (user.personalPlays || []).forEach((play) => {
            if (play.count >= config.MIN_PLAY_THRESHOLD) {
                const musicId = play.music.toString();
                if (!map.has(musicId)) map.set(musicId, new Set());
                map.get(musicId).add(uid);
            }
        });
    }

    return map;
}

/**
 * Calcula a pontuação de uma música candidata com base na similaridade com o perfil do utilizador.
 * A pontuação é ajustada por um fator de penalização baseado no tamanho do vetor candidato.
 * @param {Set<string>} candidateVector - Conjunto de utilizadores que interagem com a música candidata
 * @param {Object} profile - Perfil do utilizador com pesos para cada música conhecida
 * @param {Map<string, Set<string>>} musicUserMap - Mapa de músicas para conjuntos de utilizadores
 * @returns {number} - Pontuação total da música candidata
 */
function scoreCandidate(candidateVector, profile, musicUserMap) {
    let totalScore = 0;

    for (const [knownId, weight] of Object.entries(profile)) {
        const knownVector = musicUserMap.get(knownId);
        if (!knownVector || knownVector.size === 0) continue;

        const similarity = cosineSimilarity(candidateVector, knownVector);
        const penalty = Math.log2(config.PENALTY_BASE + candidateVector.size);
        totalScore += (similarity * weight) / penalty;
    }

    return totalScore;
}

/**
 * Retorna músicas populares que o utilizador ainda não conhece para completar a lista de sugestões.
 * Se o número de recomendações já for suficiente, retorna um array vazio.
 * @param {Array} allMusics - Lista completa de músicas disponíveis
 * @param {Set<string>} knownMusicIds - IDs de músicas que o utilizador já conhece
 * @param {Array} top - Recomendações já geradas
 * @param {number} count - Número total de recomendações desejadas (incluindo as já geradas)
 * @returns {Array} - Lista de músicas adicionais para completar as recomendações
 */
function getFallbackRecommendations(
    allMusics,
    knownMusicIds,
    top,
    count = config.TOP_N
) {
    return allMusics
        .filter(
            (m) =>
                !knownMusicIds.has(m._id.toString()) &&
                !top.some((r) => r._id.toString() === m._id.toString())
        )
        .slice(0, count - top.length)
        .map((m) => ({
            _id: m._id,
            title: m.title,
            coverUrl: m.coverUrl,
            plays: m.plays || 0,
            audioUrl: m.audioUrl,
            artist: m.artist
                ? { _id: m.artist._id, name: m.artist.name }
                : { name: "Desconhecido" },
            album: m.album ? { _id: m.album._id, title: m.album.title } : null,
            score: 0,
        }));
}

/**
 * @function getRecommendationsForUser
 * @description
 * Gera recomendações musicais personalizadas para o utilizador autenticado.
 */
exports.getRecommendationsForUser = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();

        // Perfil de interações + conjunto de músicas conhecidas
        const { profile, knownMusicIds } = await getUserMusicProfile(userId);

        if (knownMusicIds.size === 0) {
            const fallback = await getTopMusics(config.TOP_N);
            logger.info(`Fallback direto: sem interações para user ${userId}`);
            return res.json({ success: true, data: fallback });
        }

        // Músicas candidatas
        const allMusics = await Music.find({ isDeleted: false })
            .sort({ plays: -1 })
            .limit(config.CANDIDATE_LIMIT)
            .select("title artist album coverUrl plays audioUrl likes")
            .populate("artist", "name")
            .populate("album", "title")
            .lean();

        // Garantir que os likes das músicas do perfil também estão presentes
        const profileMusics = await Music.find({
            _id: { $in: [...knownMusicIds] },
        })
            .select("likes")
            .lean();

        // Carrega todos os utilizadores com sinais colaborativos
        const users = await User.find({})
            .select("library personalPlays")
            .lean();

        // Matriz de interações: musicId → set de utilizadores
        const musicUserMap = buildMusicUserMapExpanded(
            [...allMusics, ...profileMusics],
            users
        );

        const recommendations = [];

        for (const music of allMusics) {
            const musicId = music._id.toString();
            if (knownMusicIds.has(musicId)) continue;

            const candidateVector = musicUserMap.get(musicId);
            if (!candidateVector || candidateVector.size === 0) continue;

            const score = scoreCandidate(
                candidateVector,
                profile,
                musicUserMap
            );

            if (score > 0) {
                recommendations.push({
                    _id: music._id,
                    title: music.title,
                    coverUrl: music.coverUrl,
                    plays: music.plays || 0,
                    audioUrl: music.audioUrl,
                    artist: music.artist
                        ? { _id: music.artist._id, name: music.artist.name }
                        : { name: "Desconhecido" },
                    album: music.album
                        ? { _id: music.album._id, title: music.album.title }
                        : null,
                    score,
                });
            }
        }

        // Ordena e seleciona top N
        recommendations.sort((a, b) => b.score - a.score);
        let top = recommendations.slice(0, config.TOP_N);

        // Fallback misto ou total
        if (top.length < config.TOP_N) {
            const fallbackFromTop = await getTopMusics(config.TOP_N * 2);
            const fallbackExtras = getFallbackRecommendations(
                fallbackFromTop,
                knownMusicIds,
                top,
                config.TOP_N
            );
            top = [...top, ...fallbackExtras];
        }

        // Mesmo com fallback, pode falhar por algum motivo (ex: não há músicas no sistema)
        if (top.length === 0) return res.status(204).send();

        logger.info(`Sugestões finais para ${userId}: ${top.length} músicas`);
        return res.json({ success: true, data: top });
    } catch (err) {
        logger.error("Erro ao gerar recomendações", {
            userId: req.user?._id || "desconhecido",
            stack: err.stack,
        });
        next(err);
    }
};

/**
 * Calcula a similaridade cosseno entre dois conjuntos de utilizadores.
 *
 * @param {Set<string>} setA - Primeiro conjunto de utilizadores
 * @param {Set<string>} setB - Segundo conjunto de utilizadores
 * @returns {number} - Similaridade cosseno entre os dois conjuntos (0 a 1)
 */
function cosineSimilarity(setA, setB) {
    const [small, large] = setA.size < setB.size ? [setA, setB] : [setB, setA];
    let intersection = 0;
    for (const user of small) {
        if (large.has(user)) intersection++;
    }
    const normA = Math.sqrt(setA.size);
    const normB = Math.sqrt(setB.size);
    if (normA === 0 || normB === 0) return 0;
    return intersection / (normA * normB);
}

/**
 * Fallback puro: top músicas mais tocadas
 * Se o utilizador não tiver interações, retorna as músicas mais populares.
 * @param {number} limit - Número máximo de músicas a retornar (default: config.TOP_N)
 * @returns {Promise<Array>} - Lista de músicas populares com detalhes
 * @throws {Error} - Se ocorrer um erro ao consultar a base de dados
 */
async function getTopMusics(limit = config.TOP_N) {
    const top = await Music.find({ isDeleted: false })
        .sort({ plays: -1 })
        .limit(limit)
        .select("title artist album coverUrl plays audioUrl")
        .populate("artist", "name")
        .populate("album", "title")
        .lean();

    return top.map((m) => ({
        _id: m._id,
        title: m.title,
        coverUrl: m.coverUrl,
        plays: m.plays || 0,
        audioUrl: m.audioUrl,
        artist: m.artist
            ? { _id: m.artist._id, name: m.artist.name }
            : { name: "Desconhecido" },
        album: m.album ? { _id: m.album._id, title: m.album.title } : null,
        score: 0,
    }));
}