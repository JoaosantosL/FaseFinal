/**
 * @file chatbotArtistController.js
 * @description
 * Controlador que responde a perguntas sobre artistas usando a OpenAI API.
 *
 * Fluxo:
 * 1. Recebe `artistName` e `question`
 * 2. Procura artista público (fuzzy match)
 * 3. Carrega álbuns e músicas (com likes e plays)
 * 4. Gera prompt com dados (bio, percurso, etc.)
 * 5. Envia para a OpenAI
 * 6. Responde com texto da IA
 */

const Artist = require("../models/Artist");
const openai = require("../config/openai");
const { buildPromptFromArtistData } = require("../utils/promptBuilder");
const catchAsync = require("../utils/catchAsync");
const sanitize = require("../utils/sanitize");
const logger = require("../utils/logger");

/**
 * @function getArtistInfoFromAI
 * @route POST /api/chatbot/artist-info
 * @access Público
 *
 * @param {Request} req - Deve conter { artistName, question }
 * @param {Response} res - Resposta textual da IA
 */
const getArtistInfoFromAI = catchAsync(async (req, res) => {
    const { artistName, question } = req.body;

    // 1. Sanitiza inputs
    const name = sanitize(artistName || "").toLowerCase();
    const questionSanitized = sanitize(question || "");

    if (!name || !questionSanitized) {
        return res.status(400).json({
            success: false,
            error: "É necessário fornecer o nome do artista e a pergunta.",
        });
    }

    // 2. Carrega todos os artistas públicos (só name para fuzzy match)
    const allArtists = await Artist.find({ isPublic: true })
        .select("name")
        .lean();

    const match = allArtists.find(
        (artist) =>
            artist.name.toLowerCase().localeCompare(name, "pt", {
                sensitivity: "base",
                usage: "search",
            }) === 0
    );

    if (!match) {
        return res.status(404).json({
            success: false,
            error: "Artista não encontrado ou perfil ainda não está público.",
        });
    }

    // 3. Carrega dados completos do artista (com álbuns e músicas)
    const artist = await Artist.findOne({ name: match.name })
        .populate({
            path: "albums",
            select: "title musics",
            populate: {
                path: "musics",
                select: "title plays reactions",
            },
        })
        .lean();

    if (!artist) {
        return res.status(404).json({
            success: false,
            error: "Não foi possível carregar os dados do artista.",
        });
    }

    // 4. Gera prompt com base nos dados
    const prompt = buildPromptFromArtistData(artist, questionSanitized);

    // 5. Chamada à OpenAI API
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 500,
        messages: [
            {
                role: "system",
                content:
                    "Estás a ajudar utilizadores a conhecer melhor artistas musicais com base em dados fornecidos. Sê claro, conciso e informativo.",
            },
            { role: "user", content: prompt },
        ],
    });

    const resposta = completion.choices?.[0]?.message?.content?.trim();

    logger.info(`Resposta da IA para artista "${artist.name}"`);

    res.json({
        success: true,
        data: {
            artist: artist.name,
            answer: resposta || "Não foi possível gerar resposta.",
        },
    });
});

module.exports = { getArtistInfoFromAI };
