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
const { getUserMusicProfile } = require("../utils/recommendationUtils");
const logger = require("../utils/logger");

/**
 * @function getRecommendationsForUser
 * @description
 * Gera uma lista personalizada de músicas recomendadas para o utilizador autenticado.
 * Usa cosine similarity entre interações de utilizadores para calcular um score.
 * Em caso de falta de dados, retorna músicas mais tocadas (fallback).
 * @route GET /api/recommendations
 * @access Privado
 *
 * @param {Request} req - Objeto Express com o utilizador autenticado (`req.user`)
 * @param {Response} res - Resposta JSON com lista de recomendações
 * @param {Function} next - Função de erro Express (caso ocorra exceção)
 */
exports.getRecommendationsForUser = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();

        // Obtem o perfil do utilizador com os seus pesos (likes, biblioteca, plays)
        const profile = await getUserMusicProfile(userId);
        const knownMusicIds = new Set(Object.keys(profile));

        // Fallback para utilizadores sem histórico suficiente
        if (knownMusicIds.size === 0) {
            // Apenas uma query de fallback, cachear se possível
            const fallback = await getTopMusics(3);

            // Loga que foi necessário usar fallback (sem indentação para evitar overhead)
            logger.info(
                `Fallback: Sem dados de perfil para user ${userId}: ` +
                    JSON.stringify({
                        topFallback: fallback.map((r) => ({
                            id: r._id,
                            title: r.title,
                            artist: r.artist?.name,
                            plays: r.plays,
                        })),
                    })
            );

            return res.json({ success: true, data: fallback });
        }

        // Carrega apenas as 100 músicas mais populares para limitar candidatos
        const allMusics = await Music.find({ isDeleted: false })
            .sort({ plays: -1 })
            .limit(100)
            .select("title artist album coverUrl plays audioUrl likes")
            .populate("artist", "name")
            .populate("album", "title")
            .lean();

        // Constrói um mapa: musicId → Set de utilizadores que deram like
        const musicUserMap = new Map();
        for (const music of allMusics) {
            const id = music._id.toString();
            const userSet = new Set(
                (music.likes || []).map((u) => u.toString())
            );
            musicUserMap.set(id, userSet);
        }

        const recommendations = [];

        // Loop sobre músicas candidatas (limitadas)
        for (const music of allMusics) {
            const musicId = music._id.toString();

            // Ignora músicas que o utilizador já conhece
            if (knownMusicIds.has(musicId)) continue;

            const candidateVector = musicUserMap.get(musicId);
            if (!candidateVector || candidateVector.size === 0) continue;

            let totalScore = 0;

            // Loop sobre músicas conhecidas (perfil do utilizador)
            for (const knownId of knownMusicIds) {
                const knownVector = musicUserMap.get(knownId);
                if (!knownVector || knownVector.size === 0) continue;

                // Calcula a similaridade cosseno
                const similarity = cosineSimilarity(
                    candidateVector,
                    knownVector
                );
                const weight = profile[knownId]; // peso individual (ex: 3 para likes)

                totalScore += similarity * weight;
            }

            // Guarda a música apenas se houver score relevante
            if (totalScore > 0) {
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
                    score: totalScore,
                });
            }
        }

        // Se não houver recomendações, usar fallback (reutiliza array já carregado)
        if (recommendations.length === 0) {
            return res.json({
                success: true,
                data: allMusics.slice(0, 3).map((music) => ({
                    _id: music._id,
                    title: music.title,
                    coverUrl: music.coverUrl,
                    plays: music.plays || 0,
                    artist: music.artist
                        ? { _id: music.artist._id, name: music.artist.name }
                        : { name: "Desconhecido" },
                    album: music.album
                        ? { _id: music.album._id, title: music.album.title }
                        : null,
                    score: 0,
                })),
            });
        }

        // Ordena por score e devolve o top 3 (usa uma heap para eficiência se quiseres escalar)
        recommendations.sort((a, b) => b.score - a.score);
        const top = recommendations.slice(0, 3);

        // Logging do resultado final (sem payload grande)
        logger.info(`Recomendações para user ${userId}: ${top.length} músicas`);
        logger.info(
            `Score de cada recomendação: ${JSON.stringify(
                top.map((r) => ({
                    id: r._id,
                    title: r.title,
                    artist: r.artist.name,
                    score: r.score,
                }))
            )}`
        );

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
 * @function cosineSimilarity
 * @description
 * Calcula a similaridade entre dois conjuntos de utilizadores com base no cosseno entre os vetores.
 *
 * @param {Set<string>} setA - Conjunto A de utilizadores
 * @param {Set<string>} setB - Conjunto B de utilizadores
 * @returns {number} - Valor entre 0 e 1 representando a similaridade
 */
function cosineSimilarity(setA, setB) {
    // Interseção dos utilizadores que deram like a ambas as músicas
    const intersection = [...setA].filter((userId) => setB.has(userId)).length;

    // Normalização dos vetores
    const normA = Math.sqrt(setA.size);
    const normB = Math.sqrt(setB.size);
    if (normA === 0 || normB === 0) return 0;

    // Calcula o cosseno da interseção normalizada
    return intersection / (normA * normB);
}

/**
 * Função auxiliar que devolve as músicas mais tocadas no sistema.
 * @param {number} limit - Quantas músicas devolver
 * @returns {Promise<Array>} Lista de músicas com título, capa e artista
 */
/**
 * Função auxiliar que devolve as músicas mais tocadas no sistema.
 * @param {number} limit - Quantas músicas devolver
 * @returns {Promise<Array>} Lista de músicas com título, capa e artista
 */
async function getTopMusics(limit = 3) {
    const top = await Music.find({ isDeleted: false })
        .sort({ plays: -1 })
        .limit(limit)
        .select("title artist album coverUrl plays")
        .populate("artist", "name")
        .populate("album", "title")
        .lean();

    return top.map((m) => ({
        _id: m._id,
        title: m.title,
        coverUrl: m.coverUrl,
        plays: m.plays || 0,
        artist: m.artist
            ? { _id: m.artist._id, name: m.artist.name }
            : { name: "Desconhecido" },
        album: m.album ? { _id: m.album._id, title: m.album.title } : null,
        score: 0,
    }));
}
