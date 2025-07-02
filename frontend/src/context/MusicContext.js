/**
 * @file MusicContext.jsx
 * @description
 * Contexto global de música para a aplicação SoundDream.
 * Permite controlar:
 * - Música atual
 * - Estado de reprodução (tocar/pausar)
 * - Fila de reprodução (queue)
 * - Histórico de músicas tocadas (para voltar atrás)
 * - Shuffle da fila (reprodução aleatória)
 *
 * Usado por componentes como `MusicPlayer` e `MusicCard`.
 */

import { createContext, useState } from "react";
import api from "../services/axios";

// Criação do contexto
export const MusicContext = createContext();

/**
 * @component MusicProvider
 * @description
 * Componente que envolve a aplicação e fornece o contexto de música.
 * Inclui funções para tocar música, avançar, recuar, pausar e embaralhar.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes com acesso ao contexto
 * @returns {JSX.Element}
 */
export function MusicProvider({ children }) {
    // Música atual (em reprodução)
    const [currentMusic, setCurrentMusic] = useState(null);

    // Estado de reprodução
    const [isPlaying, setIsPlaying] = useState(false);

    // Fila de músicas (playlist, álbum, ou lista qualquer)
    const [queue, setQueue] = useState([]);

    // Índice atual dentro da fila
    const [currentIndex, setCurrentIndex] = useState(-1);

    // Histórico de músicas anteriores
    const [history, setHistory] = useState([]);

    // Estado de shuffle ativado ou não
    const [isShuffling, setIsShuffling] = useState(false);

    // Fila original antes do shuffle (permite restaurar)
    const [originalQueue, setOriginalQueue] = useState([]);

    /**
     * @function playMusic
     * Toca uma música específica e atualiza a fila, índice e histórico.
     *
     * @param {Object} music - Objeto da música a tocar
     * @param {Array} [queueList=[]] - Lista de músicas (nova fila)
     * @param {number} [index=-1] - Índice da música na fila
     */
    const playMusic = (music, queueList = [], index = -1) => {
        if (currentMusic) {
            setHistory((prev) => [...prev, currentMusic]);
        }

        setCurrentMusic({
            title: music.title,
            artist:
                typeof music.artist === "object"
                    ? music.artist
                    : { name: music.artist || "Desconhecido" },

            album:
                typeof music.album === "object"
                    ? music.album
                    : { title: music.album || "Desconhecido" },

            coverUrl: `${process.env.REACT_APP_BACKEND_URL}${music.coverUrl}`,
            audioUrl: `${process.env.REACT_APP_BACKEND_URL}${music.audioUrl}`,
        });

        setQueue(queueList);
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    /**
     * @function playNext
     * Avança para a próxima música na fila ou reinicia caso esteja no fim.
     * Se não houver fila, tenta buscar uma música aleatória.
     */
    const playNext = async () => {
        if (queue.length > 0 && currentIndex >= 0) {
            const nextIndex = (currentIndex + 1) % queue.length;
            const next = queue[nextIndex];
            setCurrentIndex(nextIndex);
            playMusic(next, queue, nextIndex);
        } else {
            try {
                const res = await api.get("/music");
                const musics = res.data.data.filter((m) => !m.isDeleted);
                const aleatoria =
                    musics[Math.floor(Math.random() * musics.length)];
                playMusic(aleatoria);
            } catch (err) {
                console.error("Erro ao obter música aleatória:", err);
            }
        }
    };

    /**
     * @function playPrevious
     * Volta à música anterior na fila ou usa o histórico (se disponível).
     */
    const playPrevious = () => {
        if (queue.length > 0 && currentIndex > 0) {
            const prev = queue[currentIndex - 1];
            setCurrentIndex(currentIndex - 1);
            playMusic(prev, queue, currentIndex - 1);
        } else if (history.length > 0) {
            const ultima = history[history.length - 1];
            setHistory((prev) => prev.slice(0, -1));
            setCurrentMusic(ultima);
            setIsPlaying(true);
        }
    };

    /**
     * @function togglePlayPause
     * Alterna entre play e pause.
     */
    const togglePlayPause = () => setIsPlaying((prev) => !prev);

    /**
     * @function shuffleQueue
     * Ativa o modo aleatório, mantendo a música atual como primeira da fila.
     */
    const shuffleQueue = () => {
        if (queue.length === 0 || currentIndex === -1) return;

        const current = queue[currentIndex];
        const remaining = [
            ...queue.slice(0, currentIndex),
            ...queue.slice(currentIndex + 1),
        ];
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        const newQueue = [current, ...shuffled];

        setOriginalQueue(queue); // guarda para restaurar depois
        setQueue(newQueue);
        setCurrentIndex(0);
        setIsShuffling(true);
    };

    /**
     * @function toggleShuffle
     * Ativa ou desativa o modo aleatório. Restaura a fila original se for desativado.
     */
    const toggleShuffle = () => {
        if (!isShuffling) {
            shuffleQueue();
        } else {
            const index = originalQueue.findIndex(
                (m) => m.title === currentMusic.title
            );
            setQueue(originalQueue);
            setCurrentIndex(index);
            setIsShuffling(false);
        }
    };

    return (
        <MusicContext.Provider
            value={{
                currentMusic,
                setCurrentMusic,
                isPlaying,
                setIsPlaying,
                togglePlayPause,
                queue,
                setQueue,
                currentIndex,
                setCurrentIndex,
                playNext,
                playPrevious,
                playMusic,
                isShuffling,
                toggleShuffle,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
}
