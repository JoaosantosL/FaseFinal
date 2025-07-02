/**
 * @file PlaylistDetail.jsx
 * @description
 * Página que apresenta o conteúdo de uma playlist privada do utilizador.
 * Permite:
 * - Ver o nome da playlist
 * - Listar todas as músicas incluídas
 * - Reproduzir todas as músicas da playlist
 * - Remover músicas individualmente
 */

import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/axios";
import { AuthContext } from "../context/AuthContext";
import { MusicContext } from "../context/MusicContext";
import MusicCard from "../components/MusicCard";
import { FaPlay } from "react-icons/fa";
import getCsrfToken from "../utils/getCsrfToken";

/**
 * @component PlaylistDetail
 * Página que mostra os detalhes de uma playlist.
 *
 * @returns {JSX.Element}
 */
export default function PlaylistDetail() {
    // ID da playlist extraído da URL
    const { playlistId } = useParams();

    // Contextos globais
    const { user } = useContext(AuthContext);
    const {
        setQueue,
        setCurrentIndex,
        setIsPlaying,
        setCurrentMusic,
    } = useContext(MusicContext);

    // Estado local da playlist e de erro
    const [playlist, setPlaylist] = useState(null);
    const [error, setError] = useState(null);

    // Carrega os dados da playlist do utilizador autenticado
    useEffect(() => {
        if (!user || !playlistId) return;

        api
            .get(`/users/${user._id}/playlists`)
            .then((res) => {
                const found = res.data.data.find((pl) => pl._id === playlistId);
                if (found) setPlaylist(found);
                else setError("Playlist não encontrada.");
            })
            .catch((err) => {
                console.error("Erro ao carregar playlist:", err);
                setError("Erro ao carregar a playlist.");
            });
    }, [user, playlistId]);

    /**
     * @function handleRemoveMusic
     * Remove uma música da playlist após confirmação e com proteção CSRF.
     *
     * @param {string} musicId - ID da música a remover
     */
    const handleRemoveMusic = async (musicId) => {
        const confirmar = window.confirm("Remover esta música da playlist?");
        if (!confirmar) return;

        try {
            const token = await getCsrfToken();

            await api.patch(
                `/users/${user._id}/playlists/${playlistId}`,
                { musicId, remove: true },
                {
                    headers: {
                        "X-CSRF-Token": token,
                    },
                }
            );

            // Atualiza o estado da playlist local (removendo a música)
            setPlaylist((prev) => ({
                ...prev,
                musics: prev.musics.filter((m) => m._id !== musicId),
            }));
        } catch (err) {
            console.error("Erro ao remover música da playlist:", err);
            toast.error("Erro ao remover música da playlist.");
        }
    };

    /**
     * @function handlePlayAll
     * Inicia a reprodução de todas as músicas da playlist,
     * definindo a fila (queue) e a música atual.
     */
    const handlePlayAll = () => {
        if (!playlist?.musics || playlist.musics.length === 0) return;

        setQueue(playlist.musics);
        setCurrentIndex(0);

        const first = playlist.musics[0];

        setCurrentMusic({
            title: first.title,
            artist: first.artist?.name || "Desconhecido",
            album: first.album?.title || "Desconhecido",
            coverUrl: `${process.env.REACT_APP_BACKEND_URL}${first.coverUrl}`,
            audioUrl: `${process.env.REACT_APP_BACKEND_URL}${first.audioUrl}`,
        });

        setIsPlaying(true);
    };

    // Erro ao carregar
    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center fw-bold shadow-sm">
                    {error}
                </div>
            </div>
        );
    }

    // A mostrar enquanto a playlist está a ser carregada
    if (!playlist) {
        return (
            <div className="container py-5 text-center">
                <p className="text-light">A carregar playlist...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Cabeçalho com nome da playlist e botão para tocar tudo */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold text-center" style={{ color: "var(--text)" }}>
                    {playlist.name}
                </h2>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handlePlayAll}>
                    <FaPlay /> Tocar Playlist
                </button>
            </div>

            {/* Lista de músicas da playlist */}
            {playlist.musics.length === 0 ? (
                <p className="text-center text-light">Esta playlist ainda não tem músicas.</p>
            ) : (
                <div className="row g-4">
                    {playlist.musics.map((music) => (
                        <div className="col-sm-6 col-md-4" key={music._id}>
                            <MusicCard
                                _id={music._id}
                                title={music.title}
                                artist={music.artist}
                                album={music.album}
                                coverUrl={music.coverUrl}
                                audioUrl={music.audioUrl}
                                plays={music.plays}
                                isInLibrary={true}
                                allowAddToPlaylist={true}
                                onRemove={() => handleRemoveMusic(music._id)}
                                musicList={playlist.musics}
                                likedByMe={music.likedByMe}
                                likesCount={music.likesCount}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Rodapé */}
            <div className="text-center muted small mt-5">
                Esta playlist está sempre contigo
            </div>
        </div>
    );
}