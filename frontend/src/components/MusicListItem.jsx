/**
 * @file MusicListItem.jsx
 * @description
 * Item de música em formato de lista (linha única), com thumbnail, título, artista/álbum
 * e ações rápidas (tocar, like, biblioteca, playlist).
 */

import { useState, useEffect } from "react";
import { FaPlay, FaStar, FaHeart, FaTrashAlt, FaPlus } from "react-icons/fa";
import getCsrfToken from "../utils/getCsrfToken";
import AddToPlaylistModal from "./AddToPlaylistModal";
import api from "../services/axios";
import { toast } from "react-toastify";

/**
 * @component MusicListItem
 * @description
 * Componente que representa um item de música numa lista vertical.
 * Apresenta a capa da música, título, artista/álbum e botões circulares:
 * - Play, Like, Biblioteca e Playlist.
 *
 * @param {Object} props
 * @param {Object} props.music - Objeto da música com: _id, title, artist, album, coverUrl, likedByMe, likesCount, isInLibrary
 * @param {string} props.userId - ID do utilizador autenticado
 * @param {Function} [props.onUpdate] - Função para forçar refresh após alterações (ex: depois de dar/desfazer like)
 * @param {Function} [props.onPlay] - Função chamada quando o utilizador carrega no botão de tocar música
 * @returns {JSX.Element}
 */
export default function MusicListItem({ music, userId, onUpdate, onPlay }) {
    const [liked, setLiked] = useState(true); // Todas as músicas estão gostadas nesta página
    const [likesCount, setLikesCount] = useState(music.likesCount || 0);
    const [inLibrary, setInLibrary] = useState(music.isInLibrary || false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setInLibrary(music.isInLibrary || false);
    }, [music.isInLibrary]);

    /**
     * Gosta/Desgosta da música
     */
    const removeLike = async () => {
        try {
            const token = await getCsrfToken();

            if (liked) {
                // Se já gostava, remove o like
                const res = await api.delete(`/music/${music._id}/like`, {
                    headers: { "X-CSRF-Token": token },
                });
                setLiked(false);
                setLikesCount(res.data.data.totalLikes);

                // Chama a função onUpdate para remover do estado (pai)
                if (onUpdate) onUpdate();
            } else {
                // Se ainda não gostava, adiciona o like
                const res = await api.post(`/music/${music._id}/like`, null, {
                    headers: { "X-CSRF-Token": token },
                });
                setLiked(true);
                setLikesCount(res.data.data.totalLikes);
            }
        } catch {
            toast.error("Erro ao alterar like");
        }
    };

    /**
     * Adiciona ou remove a música da biblioteca pessoal
     */
    const toggleLibrary = async () => {
        try {
            const token = await getCsrfToken();

            if (inLibrary) {
                await api.delete(`/users/${userId}/library/${music._id}`, {
                    headers: { "X-CSRF-Token": token },
                });
                setInLibrary(false);
                toast.info("Removido da biblioteca");
            } else {
                await api.post(
                    `/users/${userId}/library`,
                    { musicId: music._id },
                    { headers: { "X-CSRF-Token": token } }
                );
                setInLibrary(true);
                toast.success("Guardado na biblioteca");
            }
        } catch {
            toast.error("Erro ao atualizar biblioteca");
        }
    };

    return (
        <li className="music-list-item">
            {/* Thumbnail da música */}
            <img
                src={`${process.env.REACT_APP_BACKEND_URL}${music.coverUrl}`}
                alt="Capa"
                className="cover"
            />

            {/* Título e artista/álbum */}
            <div className="info">
                <div className="title">{music.title}</div>
                <div className="sub">
                    {music.artist?.name} — {music.album?.title}
                </div>
            </div>

            {/* Botões de ações rápidas */}
            <div className="actions">
                {/* Botão de tocar música (usa função passada pelo componente pai) */}
                <button className="btn-circle play" onClick={onPlay}>
                    <FaPlay />
                </button>

                {/* Botão de like/deslike */}
                <button className="btn-circle active" onClick={removeLike}>
                    <FaStar />
                </button>

                {/* Botão para adicionar/remover da biblioteca */}
                <button
                    className={`btn-circle ${inLibrary ? "active" : ""}`}
                    onClick={toggleLibrary}
                >
                    {inLibrary ? <FaTrashAlt /> : <FaHeart />}
                </button>

                {/* Botão de playlist (ainda não implementado) */}
                <button
                    className="btn-circle"
                    onClick={() => setShowModal(true)}
                >
                    <FaPlus />
                </button>
                {/* Contador de favoritos */}
                <span className="small sub ms-2">Fav: {likesCount}</span>

                {showModal && (
                    <AddToPlaylistModal
                        userId={userId}
                        musicId={music._id}
                        title={music.title}
                        onClose={(added) => {
                            setShowModal(false);
                            if (added) toast.success("Música adicionada à playlist!");
                        }}
                    />
                )}
            </div>
        </li>
    );
}