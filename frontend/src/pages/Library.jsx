/**
 * @file Library.jsx
 * @description
 * Página que apresenta a biblioteca pessoal do utilizador autenticado.
 * Mostra todas as músicas guardadas, com opção de:
 * - Tocar tudo de seguida
 * - Remover músicas da biblioteca
 * - Ver a última vez que cada música foi ouvida
 */

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { MusicContext } from "../context/MusicContext";
import api from "../services/axios";
import MusicCard from "../components/MusicCard";
import { FaPlay } from "react-icons/fa";

/**
 * @component Library
 * @description
 * Mostra as músicas da biblioteca pessoal do utilizador.
 * Permite tocar todas de seguida e ver a última reprodução de cada uma.
 *
 * @returns {JSX.Element}
 */
export default function Library() {
    const { user } = useContext(AuthContext);          // Dados do utilizador autenticado
    const { playMusic } = useContext(MusicContext);    // Função para iniciar reprodução

    const [library, setLibrary] = useState([]);        // Lista de músicas na biblioteca
    const [error, setError] = useState(null);          // Mensagem de erro, se existir

    // Quando o componente monta, carrega a biblioteca do utilizador
    useEffect(() => {
        if (!user) return;

        api.get(`/users/${user._id}/library`)
            .then((res) => setLibrary(res.data.data))
            .catch((err) => {
                console.error("Erro ao carregar biblioteca:", err);
                setError("Erro ao carregar a biblioteca.");
            });
    }, [user]);

    /**
     * @function handlePlayAll
     * @description
     * Inicia a reprodução da primeira música da biblioteca, com fila completa
     */
    const handlePlayAll = () => {
        if (library.length === 0) return;
        playMusic(library[0], library, 0);
    };

    return (
        <div className="container py-5">
            {/* Cabeçalho com título e botão "Tocar Tudo" */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold text-center" style={{ color: "var(--text)" }}>
                    A Minha Biblioteca
                </h2>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handlePlayAll}
                >
                    <FaPlay /> Tocar Tudo
                </button>
            </div>

            {/* Se existir erro, mostra alerta */}
            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            {/* Se ainda estiver a carregar (sem erro) */}
            {library.length === 0 && !error && (
                <div className="text-center muted fst-italic">
                    A carregar biblioteca...
                </div>
            )}

            {/* Listagem das músicas da biblioteca */}
            <div className="row g-4">
                {library.map((music) => (
                    <div className="col-sm-6 col-md-4" key={music._id}>
                        <MusicCard
                            _id={music._id}
                            title={music.title}
                            artist={music.artist}
                            album={music.album}
                            coverUrl={music.coverUrl}
                            audioUrl={music.audioUrl}
                            plays={music.plays}
                            personalPlays={music.personalPlays}
                            showPersonalPlays={true}
                            isInLibrary={true}
                            musicList={library} // usado para criar a fila
                            allowAddToPlaylist={true}
                            onRemove={() =>
                                setLibrary((prev) => prev.filter((m) => m._id !== music._id))
                            }
                            likedByMe={music.likedByMe}
                            likesCount={music.likesCount}
                        />

                        {/* Última vez ouvida, se disponível */}
                        <div className="text-center mt-2 small muted">
                            {music.lastPlayedAt && (
                                <>
                                    <span title="Última vez ouvida">
                                        Última:{" "}
                                        {new Date(music.lastPlayedAt).toLocaleDateString("pt-PT", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rodapé simples */}
            <footer className="text-center mt-5 muted small">
                <hr className="text-secondary" />
                Guardas o que gostas. Toca o que amas.
            </footer>
        </div>
    );
}