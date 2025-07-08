/**
 * @file ChatbotPlaylist.jsx
 * @description
 * Página dedicada ao assistente interativo de criação de playlists.
 * Simula uma conversa com o utilizador para recolher preferências musicais
 * e gerar uma playlist personalizada com base nas respostas.
 */

import { useContext, useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import steps from "../data/chatbotSteps";
import api from "../services/axios";
import getCsrfToken from "../utils/getCsrfToken";
import MusicListSimpleItem from "../components/MusicListSimpleItem";
import { MusicContext } from "../context/MusicContext";
import { AuthContext } from "../context/AuthContext";

/**
 * @component ChatbotPlaylist
 * @description
 * Página de criação de playlists com interação em estilo de chat.
 */
export default function ChatbotPlaylist() {
    // Estado para guardar os passos selecionados aleatoriamente
    const [selectedSteps, setSelectedSteps] = useState([]);
    // Estado com as respostas do utilizador
    const [answers, setAnswers] = useState({});
    // Playlist sugerida pela IA
    const [playlist, setPlaylist] = useState(null);
    // Indicador de carregamento
    const [loading, setLoading] = useState(false);
    // Estado de erro
    const [error, setError] = useState(null);
    // Se a playlist já foi criada a partir da sugestão
    const [playlistCreated, setPlaylistCreated] = useState(false);

    // Referências para scroll automático
    const inputRef = useRef(null);
    const chatRef = useRef(null);

    // Contextos globais
    const { playMusic, setQueue } = useContext(MusicContext);
    const { user } = useContext(AuthContext);

    // Ao montar: define a pergunta sobre musica portuguesa como obrigatoria e 
    // escolhe aleatoriamente 4 categorias e perguntas
    useEffect(() => {
        // Função utilitária para escolher uma entrada aleatória de um array
        const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Pergunta obrigatória sobre artistas portugueses
        const fixedStep = {
            field: "portuguese",
            question: randomFrom(steps.portuguese),
        };

        // Seleciona 4 categorias aleatórias entre as restantes (excluindo "portuguese")
        const optionalFields = Object.keys(steps)
            .filter((field) => field !== "portuguese")
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 4); // Só precisamos de 4

        // Gera perguntas aleatórias para essas 4 categorias
        const randomSteps = optionalFields.map((field) => ({
            field,
            question: randomFrom(steps[field]),
        }));

        // Junta a obrigatória com as restantes aleatórias
        setSelectedSteps([fixedStep, ...randomSteps]);
    }, []);

    const currentIndex = Object.keys(answers).length;
    const isComplete = currentIndex === selectedSteps.length;

    // Quando todas as respostas estiverem dadas, envia para o backend
    useEffect(() => {
        if (isComplete && Object.keys(answers).length === 5 && user?._id) {
            setLoading(true);
            const sendRequest = async () => {
                try {
                    const csrfToken = await getCsrfToken();
                    const res = await api.post(
                        "/chatbot/playlist",
                        { answers },
                        { headers: { "csrf-token": csrfToken } }
                    );

                    // Vai buscar também os likes do utilizador
                    const likedRes = await api.get("/users/me/liked");
                    const likedIds = likedRes.data.data.map((m) => m._id);

                    // Vai buscar a biblioteca do utilizador
                    const libraryRes = await api.get(`/users/${user._id}/library`);
                    const libraryIds = libraryRes.data.data.map((m) => m._id);

                    // Enriquecer cada música com dados booleanos
                    const enriched = res.data.data.map((music) => ({
                        ...music,
                        likedByMe: likedIds.includes(music._id),
                        isInLibrary: libraryIds.includes(music._id),
                    }));

                    setPlaylist(enriched);
                } catch (err) {
                    console.error("Erro ao gerar playlist:", err);
                    setError("Erro ao gerar a playlist. Tenta novamente.");
                } finally {
                    setLoading(false);
                }
            };
            sendRequest();
        }
    }, [isComplete, answers, user]);

    /**
     * Trata do envio de cada resposta individual do utilizador
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        const value = e.target.elements.answer.value.trim();
        if (!value) return;

        const index = Object.keys(answers).length;
        const field = selectedSteps[index].field;

        setAnswers((prev) => ({ ...prev, [field]: value }));
        e.target.reset();

        setTimeout(() => {
            chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
        }, 100);
    };

    /**
     * Cria a playlist com nome escolhido pelo utilizador
     */
    const handleCreatePlaylist = async () => {
        const name = prompt("Que nome queres dar à playlist?", "Playlist sugerida por IA");

        if (!name || name.trim() === "") {
            toast.info("Criação de playlist cancelada.");
            return;
        }

        try {
            const csrfToken = await getCsrfToken();
            const musicIds = playlist.map((m) => m._id);

            await api.post(
                `/users/${user._id}/playlists`,
                {
                    name: name.trim(),
                    musics: musicIds,
                },
                {
                    headers: { "csrf-token": csrfToken },
                }
            );

            toast.success("Playlist criada com sucesso!");
            setPlaylistCreated(true);
        } catch (err) {
            console.error("Erro ao criar playlist:", err);
            toast.error("Erro ao criar playlist.");
        }
    };

    /**
     * Toca uma música da playlist sugerida
     */
    const handlePlay = (music) => {
        setQueue(playlist);
        playMusic(music, playlist, playlist.findIndex((m) => m._id === music._id));
    };

    return (
        <div className="container py-5">
            <div className="row g-5">
                {/* Coluna da simulação de chat com perguntas/respostas */}
                <div className="col-md-6">
                    <h2 className="mb-4 text-center text-md-start">Criação de Playlist Inteligente</h2>
                    <div className="chat-window" ref={chatRef}>
                        {/* Respostas já dadas */}
                        {selectedSteps.slice(0, currentIndex).map((step, i) => (
                            <div className="chat-row" key={i}>
                                <div className="bubble question-bubble">{step.question}</div>
                                <div className="bubble answer-bubble">{answers[step.field]}</div>
                            </div>
                        ))}

                        {/* Próxima pergunta se existir */}
                        {!isComplete && selectedSteps[currentIndex] && (
                            <form className="chat-row" onSubmit={handleSubmit}>
                                <div className="bubble question-bubble">
                                    {selectedSteps[currentIndex].question}
                                </div>
                                <input
                                    type="text"
                                    name="answer"
                                    className="chat-input form-control"
                                    placeholder="Escreve a tua resposta..."
                                    autoFocus
                                    ref={inputRef}
                                />
                            </form>
                        )}

                        {/* Alerta de erro se necessário */}
                        {error && (
                            <div className="alert alert-danger mt-4 text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna da playlist final com MusicListSimpleItem */}
                <div className="col-md-6">
                    {playlist || loading ? (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                {/* Botão de criar playlist ou mensagem de sucesso */}
                                {!loading && !playlistCreated && (
                                    <button
                                        className="btn btn-primary d-flex align-items-center gap-2"
                                        onClick={handleCreatePlaylist}
                                    >
                                        <FaPlus /> Criar playlist a partir desta sugestão
                                    </button>
                                )}

                                {playlistCreated && (
                                    <span className="text-success fw-bold">
                                        Playlist criada com sucesso!
                                    </span>
                                )}
                            </div>

                            {/* Se ainda está a carregar */}
                            {loading ? (
                                <div className="alert alert-info text-center">
                                    A preparar a tua playlist personalizada...
                                </div>
                            ) : (
                                <ul className="list-unstyled d-flex flex-column gap-3">
                                    {playlist.map((music) => (
                                        <MusicListSimpleItem
                                            key={music._id}
                                            music={music}
                                            onPlay={() => handlePlay(music)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}