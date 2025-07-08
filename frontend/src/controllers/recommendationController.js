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

        // 1. Perfil com pesos (likes, biblioteca, plays)
        const { profile, knownMusicIds } = await getUserMusicProfile(userId);

        // 2. Fallback direto → sem interações
        if (knownMusicIds.size === 0) {
            const fallback = await getTopMusics(config.TOP_N * 3);
            logger.info(`Fallback direto: sem interações para user ${userId}`);
            return res.json({ success: true, data: fallback });
        }

        // 3. Candidatas populadas com artista público
        const allMusicsRaw = await Music.find({ isDeleted: false })
            .sort({ plays: -1 })
            .limit(config.CANDIDATE_LIMIT)
            .select("title artist album coverUrl plays audioUrl likes")
            .populate({
                path: "artist",
                match: { isPublic: true }, // Apenas artistas públicos
                select: "name",
            })
            .populate("album", "title")
            .lean();

        const allMusics = allMusicsRaw.filter((m) => m.artist); // remove músicas de artistas privados

        // 4. Músicas do perfil (para obter os likes usados na matriz)
        const profileMusics = await Music.find({
            _id: { $in: [...knownMusicIds] },
        })
            .select("likes")
            .lean();

        // 5. Todos os utilizadores com dados colaborativos
        const users = await User.find({})
            .select("library personalPlays")
            .lean();

        // 6. Matriz de interações musicId → Set<userIds>
        const musicUserMap = buildMusicUserMapExpanded(
            [...allMusics, ...profileMusics],
            users
        );

        const recommendations = [];

        // 7. Scoring das candidatas
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
                    artist: {
                        _id: music.artist._id,
                        name: music.artist.name,
                    },
                    album: music.album
                        ? { _id: music.album._id, title: music.album.title }
                        : null,
                    score,
                });
            }
        }

        // 8. Ordenar e completar com fallback se necessário
        recommendations.sort((a, b) => b.score - a.score);
        let top = recommendations.slice(0, config.TOP_N);

        if (top.length < config.TOP_N) {
            const fallbackFromTop = await getTopMusics(config.TOP_N * 5);
            const fallbackExtras = getFallbackRecommendations(
                fallbackFromTop,
                knownMusicIds,
                top,
                config.TOP_N
            );
            top = [...top, ...fallbackExtras];
        }

        // 9. Caso raro: nenhuma música
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
 * @function getTopMusics
 * @description
 * Busca as músicas mais populares cujos artistas são públicos,
 * garantindo devolver sempre o número `limit` solicitado.
 *
 * Para isso, busca as músicas ordenadas por número de reproduções em lotes,
 * filtra as músicas de artistas privados e pára assim que obtiver `limit` músicas públicas.
 *
 * @param {number} limit - Quantidade de músicas públicas a devolver (padrão: config.TOP_N)
 * @returns {Promise<Array>} - Lista de músicas públicas ordenadas por plays
 *
 * Limitações de eficiência da função getTopMusics com batch e skip
 *
 * Apesar da função garantir sempre devolver o número exato de músicas públicas solicitadas, ela utiliza um padrão que pode ser ineficiente em bases de dados grandes:
 *	•	A função usa um loop com múltiplas queries, onde a cada iteração faz um find() com .skip() e .limit() para buscar lotes de músicas ordenadas por popularidade.
 *	•	O problema está no uso do .skip(), que para coleções grandes causa custo linear crescente.
 * Isto significa que, para um valor alto de skip, o MongoDB precisa varrer e ignorar muitos documentos antes de devolver o resultado, tornando a consulta cada vez mais lenta.
 *	•	Além disso, o loop continua a buscar lotes até preencher o número pedido de músicas públicas, podendo precisar consultar muitos documentos se houver muitos artistas privados no meio, piorando ainda mais a performance.
 *	•	Em resumo, essa abordagem não escala bem para bases de dados muito grandes, porque o custo da operação .skip() cresce conforme aumenta o número de documentos ignorados, o que pode causar latência elevada e uso excessivo de recursos.
 *
 * Alternativas recomendadas para melhor eficiência
 *	•	Utilizar um campo indexado e filtros que excluam os artistas privados já na query principal, para evitar necessidade de filtrar depois.
 *	•	Usar um cursor com filtros e limites, evitando o .skip() excessivo.
 *	•	Pré-calcular ou manter uma lista atualizada das músicas públicas populares para consultas rápidas (cache ou coleção auxiliar).
 *	•	Se necessário, usar paginação baseada em _id (range queries) em vez de .skip() para melhorar a performance.
 */
async function getTopMusics(limit = config.TOP_N) {
    const results = []; // Armazena as músicas públicas válidas encontradas
    let skip = 0; // Controla o número de músicas já "puladas" na query
    const batchSize = 10; // Quantidade de músicas a buscar por batch (ajustável)

    while (results.length < limit) {
        // Busca um lote de músicas ordenadas por número de reproduções (plays)
        const batch = await Music.find({ isDeleted: false })
            .sort({ plays: -1 }) // Ordena da mais tocada para menos tocada
            .skip(skip) // Pula as músicas já lidas nas queries anteriores
            .limit(batchSize) // Limita o lote à batchSize para não buscar tudo de uma vez
            .populate({
                path: "artist",
                select: "name isPublic", // Obtém só o nome e se o artista é público
            })
            .populate("album", "title") // Popula título do álbum
            .lean(); // Para melhorar performance e retornar objetos puros JS

        // Se o batch vier vazio, significa que já não há mais músicas para ler
        if (batch.length === 0) break;

        // Itera as músicas do batch para filtrar apenas as de artistas públicos
        for (const music of batch) {
            if (music.artist?.isPublic) {
                // Adiciona a música ao resultado final, com os dados necessários
                results.push({
                    _id: music._id,
                    title: music.title,
                    coverUrl: music.coverUrl,
                    plays: music.plays || 0,
                    audioUrl: music.audioUrl,
                    artist: {
                        _id: music.artist._id,
                        name: music.artist.name,
                    },
                    album: music.album
                        ? { _id: music.album._id, title: music.album.title }
                        : null,
                    score: 0, // Campo score para manter a estrutura consistente
                });

                // Se já temos músicas suficientes, paramos o loop
                if (results.length === limit) break;
            }
        }

        // Atualiza o skip para ler o próximo lote na próxima iteração
        skip += batchSize;
    }

    return results;
}
