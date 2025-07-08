/**
 * @file promptBuilder.js
 * @description
 * Utilidade para construir uma prompt dinâmica com base nas respostas
 * dadas pelo utilizador no assistente de criação de playlists.
 *
 * Utiliza uma estrutura semelhante a uma árvore de decisão leve
 * que adapta as instruções da prompt aos campos disponíveis.
 *
 * Campos possíveis (até 6):
 * - genre
 * - mood
 * - portuguese
 * - tempo
 * - decade
 * - context
 * - knownSongs
 */

const sanitize = require("./sanitize");

/**
 * @function buildPromptFromAnswers
 * @description Gera uma prompt adaptada com base nas respostas e músicas disponíveis.
 * @param {Object} answers - Dicionário com respostas dadas pelo utilizador
 * @param {Array<string>} availableSongs - Lista de músicas no formato "Título - Artista"
 * @returns {String} Prompt formatada para a OpenAI
 */
function buildPromptFromAnswers(answers, availableSongs = []) {
    let prompt =
        "Cria uma playlist com 10 músicas que respeitem os seguintes critérios:\n";

    if (answers.genre) {
        prompt += `- Género preferido: ${answers.genre}\n`;
    }

    if (answers.mood) {
        prompt += `- Vibe geral: ${answers.mood}\n`;
    }

    if (answers.portuguese) {
        const resposta = answers.portuguese.toLowerCase();
        if (resposta.includes("sim") || resposta.includes("claro")) {
            prompt +=
                "- Deve incluir artistas portugueses sempre que possível\n";
        } else {
            prompt += "- Não precisa de incluir artistas portugueses\n";
        }
    }

    if (answers.tempo) {
        prompt += `- Energia ou ritmo: ${answers.tempo}\n`;
    }

    if (answers.decade) {
        prompt += `- Preferência temporal: anos ${answers.decade}\n`;
    }

    if (answers.context) {
        prompt += `- Contexto ou atividade: ${answers.context}\n`;
    }

    if (answers.knownSongs) {
        const lower = answers.knownSongs.toLowerCase();
        if (lower.includes("novo") || lower.includes("descobrir")) {
            prompt +=
                "- Focar em músicas menos conhecidas e fora do mainstream\n";
        } else {
            prompt += "- Incluir músicas familiares ou populares\n";
        }
    }

    prompt += `\nEstas são as músicas disponíveis:\n`;
    prompt += availableSongs.map((s) => `- ${s}`).join("\n");

    prompt += `\n\nEscolhe 10 músicas da lista acima que melhor correspondam aos critérios.\n`;
    prompt += `Responde com um JSON neste formato:\n`;
    prompt += `[
  { "title": "Título da música", "artist": "Nome do artista" },
  ... (10 músicas no total)
]`;
    prompt += `Responde apenas com JSON válido. Não incluas explicações, notas ou texto adicional. Não uses markdown (como \`\`\`json).`;

    return prompt;
}

/**
 * @function buildPromptFromArtistData
 * @description
 * Constrói uma prompt com base nos dados do artista e na pergunta feita.
 * Inclui campos do perfil + álbuns, músicas, plays e likes.
 *
 * @param {Object} artist - Objeto do artista (com álbuns e músicas populadas)
 * @param {string} question - Pergunta feita pelo utilizador
 * @returns {string} Prompt formatada para a OpenAI
 */
function buildPromptFromArtistData(artist, question) {
    let prompt = `Quero que respondas a perguntas sobre o(a) artista "${artist.name}".\n`;
    prompt += `A pergunta do utilizador é: "${question}".\n\n`;
    prompt += `Informação disponível sobre o artista:\n`;

    if (artist.bio) prompt += `- Biografia: ${sanitize(artist.bio)}\n`;
    if (artist.percurso)
        prompt += `- Percurso artístico: ${sanitize(artist.percurso)}\n`;

    if (Array.isArray(artist.influences) && artist.influences.length) {
        prompt += `- Influências musicais: ${artist.influences.join(", ")}\n`;
    }

    if (Array.isArray(artist.facts) && artist.facts.length) {
        prompt += `- Factos e curiosidades: ${artist.facts.join("; ")}\n`;
    }

    if (artist.extraInfo) {
        prompt += `- Informação adicional: ${sanitize(artist.extraInfo)}\n`;
    }

    // Adiciona informação sobre álbuns e músicas
    if (Array.isArray(artist.albums) && artist.albums.length > 0) {
        prompt += `\nÁlbuns e músicas:\n`;

        artist.albums.forEach((album) => {
            prompt += `• Álbum: ${album.title}\n`;

            if (Array.isArray(album.musics) && album.musics.length > 0) {
                album.musics.forEach((music) => {
                    const likeCount = Array.isArray(music.reactions)
                        ? music.reactions.filter((r) => r.type === "like")
                              .length
                        : 0;

                    prompt += `   → ${music.title} (Plays: ${
                        music.plays || 0
                    }, Likes: ${likeCount})\n`;
                });
            }
        });
    }

    prompt += `\nResponde à pergunta do utilizador com base apenas na informação acima.`;

    return prompt;
}

module.exports = {
    buildPromptFromAnswers,
    buildPromptFromArtistData,
};
