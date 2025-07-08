/**
 * @file MusicListSimpleItem.jsx
 * @description
 * Versão simplificada do item de música em lista vertical, usada na página do chatbot.
 * Remove o contador de favoritos, mantendo os botões de ação: tocar, like, biblioteca e playlist.
 */

import { useState, useEffect, useContext } from "react";
import { FaPlay, FaStar, FaHeart, FaTrashAlt, FaPlus } from "react-icons/fa";
import getCsrfToken from "../utils/getCsrfToken";
import AddToPlaylistModal from "./AddToPlaylistModal";
import api from "../services/axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext"; // 🔗 Importa o contexto de autenticação

/**
 * @component MusicListSimpleItem
 * @description
 * Item de música para listas verticais, sem contador de favoritos.
 *
 * @param {Object} props
 * @param {Object} props.music - Objeto da música com dados mínimos
 * @param {Function} [props.onUpdate] - Callback após like/biblioteca
 * @param {Function} [props.onPlay] - Função para tocar a música
 */
export default function MusicListSimpleItem({ music, onUpdate, onPlay }) {
    const { user } = useContext(AuthContext); // 📥 Acede ao utilizador autenticado
    const userId = user?._id;

    const [liked, setLiked] = useState(music.likedByMe || false);
    const [inLibrary, setInLibrary] = useState(music.isInLibrary || false);
    const [showModal, setShowModal] = useState(false);

    // Atualiza o estado local se a prop mudar (re-render ou playlist nova)
    useEffect(() => {
        setInLibrary(music.isInLibrary || false);
    }, [music.isInLibrary]);

    useEffect(() => {
        setLiked(music.likedByMe || false);
    }, [music.likedByMe]);

    // Gosta ou remove like da música
    const toggleLike = async () => {
        try {
            const token = await getCsrfToken();
            if (liked) {
                await api.delete(`/music/${music._id}/like`, {
                    headers: { "X-CSRF-Token": token },
                });
                setLiked(false);
            } else {
                await api.post(`/music/${music._id}/like`, null, {
                    headers: { "X-CSRF-Token": token },
                });
                setLiked(true);
            }
            if (onUpdate) onUpdate();
        } catch {
            toast.error("Erro ao alterar like");
        }
    };

    // Adiciona ou remove da biblioteca
    const toggleLibrary = async () => {
        if (!userId || userId.length !== 24) {
            toast.error("Erro: ID do utilizador inválido.");
            return;
        }

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
            if (onUpdate) onUpdate();
        } catch (err) {
            toast.error("Erro ao atualizar biblioteca");
        }
    };

    return (
        <li className="music-list-item">
            {/* Capa */}
            <img
                src={`${process.env.REACT_APP_BACKEND_URL}${music.coverUrl}`}
                alt="Capa"
                className="cover"
            />

            {/* Info */}
            <div className="info">
                <div className="title">{music.title}</div>
                <div className="sub">
                    {music.artist?.name} — {music.album?.title}
                </div>
            </div>

            {/* Ações */}
            <div className="actions">
                {/* Tocar música */}
                <button className="btn-circle play" onClick={onPlay}>
                    <FaPlay />
                </button>

                {/* Like / Unlike */}
                <button className={`btn-circle ${liked ? "active" : ""}`} onClick={toggleLike}>
                    <FaStar />
                </button>

                {/* Biblioteca: Coração (adicionar) ou Caixote (remover) */}
                <button
                    className={`btn-circle ${inLibrary ? "active" : ""}`}
                    onClick={toggleLibrary}
                >
                    {inLibrary ? <FaTrashAlt /> : <FaHeart />}
                </button>

                {/* Adicionar à playlist */}
                <button className="btn-circle" onClick={() => setShowModal(true)}>
                    <FaPlus />
                </button>

                {/* Modal para playlists */}
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