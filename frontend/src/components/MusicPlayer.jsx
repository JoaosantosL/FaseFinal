/**
 * @file MusicPlayer.jsx
 * @description
 * Componente global fixo que reproduz a música atual da aplicação.
 * Utiliza o contexto `MusicContext` para aceder à música atual, estado de reprodução
 * e controlos como "tocar", "pausar", "anterior" e "seguinte".
 * Mostra também uma barra de progresso com interação.
 */

import { useContext, useEffect, useRef, useState } from "react";
import { MusicContext } from "../context/MusicContext";
import { FaPlay, FaPause, FaForward, FaBackward, FaRandom } from "react-icons/fa";

/**
 * @component MusicPlayer
 * @description
 * Reprodutor de música fixo no fundo da aplicação. Mostra:
 * - Informações da música (título, artista, capa)
 * - Controlo de reprodução (tocar, pausar, anterior, seguinte)
 * - Barra de progresso com tempo atual e total
 * - Botão shuffle (não funcional ainda)
 *
 * @returns {JSX.Element|null}
 */
export default function MusicPlayer() {
    const {
        currentMusic,
        isPlaying,
        togglePlayPause,
        playNext,
        playPrevious,
        toggleShuffle,
        isShuffling,
    } = useContext(MusicContext);

    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        isPlaying ? audio.play().catch(console.error) : audio.pause();
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentMusic) return;
        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) =>
                    console.warn("Erro ao tentar reproduzir:", err)
                );
            }
        }
    }, [currentMusic, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => setProgress(audio.currentTime || 0);
        const updateDuration = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", updateDuration);

        if (audio.readyState >= 1) {
            setDuration(audio.duration || 0);
            setProgress(audio.currentTime || 0);
        }

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", updateDuration);
        };
    }, [currentMusic]);

    const handleSeek = (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    const formatTime = (time) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60).toString().padStart(2, "0");
        return `${min}:${sec}`;
    };

    if (!currentMusic) return null;

    return (
        <div className="music-player">
            <div className="music-player-inner">
                {/* Info: capa + título + artista */}
                <div className="info">
                    <img
                        src={currentMusic.coverUrl}
                        alt={`Capa de ${currentMusic.title}`}
                    />
                    <div className="meta">
                        <div className="title">{currentMusic.title}</div>
                        <div className="artist">
                            {currentMusic.artist?.name} — {currentMusic.album?.title}
                        </div>
                    </div>
                </div>

                {/* Controlo de reprodução */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn-circle"
                        onClick={playPrevious}
                        aria-label="Anterior"
                    >
                        <FaBackward size={16} />
                    </button>

                    <button
                        className="btn-circle"
                        onClick={togglePlayPause}
                        aria-label={isPlaying ? "Pausar" : "Tocar"}
                    >
                        {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                    </button>

                    <button
                        className="btn-circle"
                        onClick={playNext}
                        aria-label="Seguinte"
                    >
                        <FaForward size={16} />
                    </button>

                    <button
                        className={`btn-circle ${isShuffling ? "active" : ""}`}
                        onClick={toggleShuffle}
                        aria-label="Shuffle"
                        title="Shuffle"
                    >
                        <FaRandom size={16} />
                    </button>
                </div>

                {/* Barra de tempo */}
                <div className="time">
                    <span>{formatTime(progress)}</span>
                    <div className="progress-bar" onClick={handleSeek}>
                        <div
                            className="progress"
                            style={{ width: `${(progress / duration) * 100}%` }}
                        />
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Áudio */}
                <audio ref={audioRef} src={currentMusic.audioUrl} onEnded={playNext} />
            </div>
        </div>
    );
}