/**
 * @file ArtistChatbot.jsx
 * @description
 * Componente React que simula um chat interativo com IA para saber mais sobre um artista.
 * Fluxo:
 * 1. Input do nome do artista (fuzzy match)
 * 2. Input da pergunta do utilizador
 * 3. Mostra resposta da IA em estilo de bolhas de conversa
 */

import { useState, useRef, useEffect } from "react";
import api from "../services/axios";
import { toast } from "react-toastify";
import getCsrfToken from "../utils/getCsrfToken";
import { FaArrowRight } from "react-icons/fa";

export default function ArtistChatbot({ onClose }) {
    const [step, setStep] = useState(1);
    const [artistName, setArtistName] = useState("");
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        { from: "bot", text: "Olá! Sobre que artista queres saber mais?" },
    ]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    // Scroll automático ao fundo
    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    // Submeter nome do artista
    const handleArtistSubmit = (e) => {
        e.preventDefault();
        if (!artistName.trim()) return;
        setMessages((prev) => [
            ...prev,
            { from: "user", text: `Quero saber mais sobre ${artistName}` },
            { from: "bot", text: `Ótimo! O que queres saber sobre ${artistName}?` },
        ]);
        setStep(2);
    };

    // Submeter pergunta ao artista
    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setMessages((prev) => [...prev, { from: "user", text: question }]);
        setLoading(true);

        try {
            const csrf = await getCsrfToken();
            const res = await api.post(
                "/chatbot/artist-info",
                { artistName, question },
                { headers: { "X-CSRF-Token": csrf } }
            );

            const answer = res.data.data.answer;
            setMessages((prev) => [...prev, { from: "bot", text: answer }]);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao obter resposta da IA");
            setMessages((prev) => [
                ...prev,
                {
                    from: "bot",
                    text: "Desculpa, não consegui encontrar esse artista.",
                },
            ]);
        } finally {
            setLoading(false);
            setQuestion("");
        }
    };

    return (
        <div className="chatbot-window">
            <div className="chatbot-header">
                <span>Assistente de Artistas</span>
            </div>

            <div className="chatbot-messages" ref={chatRef}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`bubble ${msg.from === "user" ? "user-message" : "bot-message"}`}
                    >
                        {msg.text}
                    </div>
                ))}

                {loading && (
                    <div className="bubble bot-message">A pensar...</div>
                )}
            </div>

            <form
                onSubmit={step === 1 ? handleArtistSubmit : handleQuestionSubmit}
                className="chatbot-input d-flex gap-2 align-items-end"
            >
                <textarea
                    className="form-control auto-expand"
                    rows={1}
                    placeholder={
                        step === 1
                            ? "Nome do artista..."
                            : `Pergunta sobre ${artistName}...`
                    }
                    value={step === 1 ? artistName : question}
                    onChange={(e) => {
                        const value = e.target.value;
                        const el = e.target;

                        if (step === 1) {
                            setArtistName(value);
                        } else {
                            setQuestion(value);
                        }

                        el.style.height = "auto";
                        el.style.overflowY = "hidden";
                        const newHeight = Math.min(el.scrollHeight, 160);
                        el.style.height = newHeight + "px";

                        if (el.scrollHeight > 160) {
                            el.style.overflowY = "auto";
                        }
                    }}
                    onKeyDown={(e) => {
                        // Enviar ao carregar Enter (sem Shift)
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // Evita quebra de linha
                            if (step === 1) {
                                handleArtistSubmit(e);
                            } else {
                                handleQuestionSubmit(e);
                            }
                        }
                    }}
                    disabled={loading}
                    style={{
                        resize: "none",
                        maxHeight: "160px",
                        lineHeight: "1.5",
                        transition: "height 0.2s ease",
                    }}
                />
                <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2 ok-button"
                    disabled={loading}
                    style={{
                        height: "42px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    <FaArrowRight />
                </button>
            </form>
        </div>
    );
}