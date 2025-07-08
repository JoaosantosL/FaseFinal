/**
 * @file chatbotPlaylistController.js
 * @description
 * Controlador responsável por gerar uma playlist personalizada com base
 * nas respostas do utilizador a um assistente estilo chatbot.
 * Usa a API da OpenAI para gerar a lista final de músicas.
 */

const Music = require("../models/Music");
const { buildPromptFromAnswers } = require("../utils/promptBuilder");
const openai = require("../config/openai");
const logger = require("../utils/logger");

/**
 * @function generatePlaylistFromChatbot
 * @description
 * Gera uma playlist personalizada com base nas preferências do utilizador,
 * excluindo músicas de artistas privados.
 *
 * @route POST /api/chatbot/playlist
 * @access Privado (JWT)
 */
exports.generatePlaylistFromChatbot = async (req, res, next) => {
    try {
        const { answers } = req.body;
        const userId = req.user._id.toString();

        if (!answers || typeof answers !== "object") {
            logger.warn("Respostas inválidas no corpo da requisição", {
                body: req.body,
            });
            return res
                .status(400)
                .json({ success: false, error: "Respostas inválidas." });
        }

        // 1. Buscar músicas de artistas públicos
        const allMusics = await Music.find({ isDeleted: false })
            .populate({
                path: "artist",
                select: "name isPublic",
                match: { isPublic: true },
            })
            .select("title artist")
            .lean();

        const filtered = allMusics.filter((m) => m.artist);
        const availableSongs = filtered.map(
            (m) => `${m.title} - ${m.artist.name}`
        );

        // 2. Criar prompt
        const prompt = buildPromptFromAnswers(answers, availableSongs);

        // 3. Enviar para OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
        });

        const raw = completion.choices?.[0]?.message?.content;

        // 4. Interpretar JSON
        let playlistIA;
        try {
            const cleaned = raw.replace(/```json|```/g, "").trim();
            playlistIA = JSON.parse(cleaned);
        } catch (jsonErr) {
            logger.error("Erro ao interpretar JSON da IA", {
                prompt,
                resposta: raw,
                erro: jsonErr.message,
            });
            return res.status(500).json({
                success: false,
                error: "Erro ao interpretar resposta da IA. Tenta novamente.",
            });
        }

        // 5. Enriquecer com dados reais
        const enrichedPlaylist = [];

        for (const track of playlistIA) {
            const music = await Music.findOne({
                title: { $regex: `^${track.title}$`, $options: "i" },
            })
                .populate({
                    path: "artist",
                    select: "name isPublic",
                })
                .populate("album", "title")
                .lean();

            if (
                music &&
                music.artist &&
                music.artist.isPublic &&
                music.artist.name.toLowerCase() === track.artist.toLowerCase()
            ) {
                const likedByMe = music.likes?.some(
                    (id) => id.toString() === userId
                );
                const likesCount = music.likes?.length || 0;
                delete music.likes;

                enrichedPlaylist.push({
                    ...music,
                    likedByMe,
                    likesCount,
                });
            } else {
                logger.warn("Música ignorada", track);
            }
        }

        // 6. Resposta final
        logger.info(`Playlist gerada com ${enrichedPlaylist.length} músicas`);
        return res.json({ success: true, data: enrichedPlaylist });
    } catch (err) {
        logger.error("Erro ao gerar playlist via chatbot", {
            message: err.message,
            stack: err.stack,
        });
        res.status(500).json({
            success: false,
            error: "Erro ao gerar playlist. Tenta novamente.",
        });
    }
};
