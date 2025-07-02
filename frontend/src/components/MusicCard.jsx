/**
 * @file MusicCard.jsx
 * @description
 * Componente reutilizável que apresenta uma música com capa, título, artista e ações possíveis.
 * Inclui botões para:
 * - Tocar a música
 * - Guardar/remover da biblioteca
 * - Adicionar/remover da playlist
 * - Dar like (com estrela) e ver total de likes
 */

import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MusicContext } from "../context/MusicContext";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios";
import getCsrfToken from "../utils/getCsrfToken";

// Ícones
import { FaPlay, FaHeart, FaTrashAlt, FaPlus, FaRegStar, FaStar } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function MusicCard({
    _id,
    title,
    artist,
    album,
    coverUrl,
    audioUrl,
    plays,
    personalPlays = 0,
    showPersonalPlays = false,
    musicList,
    isInLibrary = false,
    onRemove,
    allowAddToPlaylist = false,
    onLibraryChange,
    likedByMe = false,
    likesCount: initialLikes = 0,
}) {
    const { playMusic } = useContext(MusicContext);
    const { user } = useContext(AuthContext);

    const [showModal, setShowModal] = useState(false);
    const [liked, setLiked] = useState(likedByMe);
    const [likesCount, setLikesCount] = useState(initialLikes);

    // Vai buscar os dados da música (likes) ao carregar, se autenticado
    useEffect(() => {
        // Só carrega os dados do like se o utilizador estiver autenticado
        if (!user) return;

        const fetchLikeData = async () => {
            try {
                const res = await api.get(`/music/${_id}`);
                const music = res.data.data;

                // Atualiza estado local com os dados do backend
                setLikesCount(music.likesCount || 0);
                setLiked(music.likedByMe || false);
            } catch (err) {
                console.error("Erro ao obter dados do like:", err);
            }
        };

        fetchLikeData();
    }, [user, _id]);

    // Inicia a música
    const handlePlay = async () => {
        const queueList = musicList || [];
        const index = queueList.findIndex((m) => m._id === _id);

        playMusic(
            { _id, title, artist, album, coverUrl, audioUrl },
            queueList,
            index
        );

        try {
            const token = await getCsrfToken();
            await api.post(`/music/${_id}/play`, null, {
                headers: { "X-CSRF-Token": token },
            });
        } catch (err) {
            console.error("Erro ao registar play:", err);
        }
    };

    // Like e Unlike
    const handleLike = async () => {
        try {
            const token = await getCsrfToken();
            const res = await api.post(`/music/${_id}/like`, null, {
                headers: { "X-CSRF-Token": token },
            });
            setLiked(true);
            setLikesCount(res.data.data.totalLikes);
        } catch (err) {
            toast.error("Erro ao dar like.");
        }
    };

    const handleUnlike = async () => {
        try {
            const token = await getCsrfToken();
            const res = await api.delete(`/music/${_id}/like`, {
                headers: { "X-CSRF-Token": token },
            });
            setLiked(false);
            setLikesCount(res.data.data.totalLikes);
        } catch (err) {
            toast.error("Erro ao remover like.");
        }
    };

    // Biblioteca
    const handleAddToLibrary = async () => {
        try {
            const token = await getCsrfToken();
            await api.post(
                `/users/${user._id}/library`,
                { musicId: _id },
                { headers: { "X-CSRF-Token": token } }
            );
            toast.success("Música guardada na biblioteca!");
            if (onLibraryChange) onLibraryChange("add", _id);
        } catch (err) {
            toast.error("Erro ao guardar na biblioteca.");
        }
    };

    const handleRemoveFromLibrary = async () => {
        try {
            const token = await getCsrfToken();
            await api.delete(`/users/${user._id}/library/${_id}`, {
                headers: { "X-CSRF-Token": token },
            });
            toast.success("Música removida da biblioteca!");
            if (onLibraryChange) onLibraryChange("remove", _id);
        } catch (err) {
            toast.error("Erro ao remover da biblioteca.");
        }
    };

    return (
        <div className="music-card mb-3">
            <div className="cover-container">
                <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${coverUrl}`}
                    alt={`Capa de ${title}`}
                    className="cover-image"
                />

                {/* Badge com número de plays e likes */}
                <div className="position-absolute top-0 start-50 translate-middle-x mt-2 px-3 py-1 rounded-pill fw-semibold badge-counter">
                    Plays: {plays}
                    {showPersonalPlays && typeof personalPlays === "number" && (
                        <span> | Por ti: {personalPlays}</span>
                    )}
                    <span className="ms-2">Likes: {likesCount}</span>
                </div>

                {/* Botões sobre a capa */}
                <div className="overlay-buttons">
                    {/* Play */}
                    {user && (
                        <div className="tooltip-container">
                            <button className="btn-circle" onClick={handlePlay}>
                                <FaPlay />
                            </button>
                            <span className="tooltip-text">Tocar</span>
                        </div>
                    )}

                    {/* Like (só mostra se estiver autenticado) */}
                    {user && (
                        <div className="tooltip-container">
                            <button
                                className={`btn-circle ${liked ? "active" : ""}`}
                                onClick={liked ? handleUnlike : handleLike}
                            >
                                {liked ? <FaStar /> : <FaRegStar />}
                            </button>
                            <span className="tooltip-text">
                                {liked ? "Remover Like" : "Gostar"}
                            </span>
                        </div>
                    )}

                    {/* Biblioteca */}
                    <div className="btn-group-horizontal">
                        {user && (
                            <div className="tooltip-container">
                                {!isInLibrary ? (
                                    <>
                                        <button className="btn-circle" onClick={handleAddToLibrary}>
                                            <FaHeart />
                                        </button>
                                        <span className="tooltip-text">Guardar</span>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-circle" onClick={handleRemoveFromLibrary}>
                                            <FaTrashAlt />
                                        </button>
                                        <span className="tooltip-text">Remover da Biblioteca</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Playlist */}
                        {allowAddToPlaylist && (
                            <div className="tooltip-container">
                                {onRemove ? (
                                    <>
                                        <button className="btn-circle" onClick={onRemove}>
                                            <FaXmark />
                                        </button>
                                        <span className="tooltip-text">Remover da Playlist</span>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-circle" onClick={() => setShowModal(true)}>
                                            <FaPlus />
                                        </button>
                                        <span className="tooltip-text">Adicionar à Playlist</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info da música */}
            <div className="text-center mt-2">
                <div className="fw-semibold" style={{ color: "var(--text)" }}>{title}</div>
                <div className="muted small mb-2">
                    {artist?.name || "Desconhecido"}
                    {album?.title && album?._id && (
                        <>
                            {" — "}
                            <Link
                                to={`/albums/${album._id}`}
                                className="album-link"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {album.title}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Modal playlist */}
            {showModal && (
                <AddToPlaylistModal
                    userId={user._id}
                    musicId={_id}
                    title={title}
                    onClose={(added) => {
                        setShowModal(false);
                        if (added) toast.success("Música adicionada à playlist!");
                    }}
                />
            )}
        </div>
    );
}