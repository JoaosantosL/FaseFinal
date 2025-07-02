/**
 * @file LikedSongs.jsx
 * @description
 * Página que apresenta todas as músicas que o utilizador gostou.
 * Mostra em formato de lista vertical, com thumbnail, info e ações.
 */

import { useContext, useEffect, useState } from "react";
import api from "../services/axios";
import { AuthContext } from "../context/AuthContext";
import MusicListItem from "../components/MusicListItem";
import { MusicContext } from "../context/MusicContext";
import { FaPlay } from "react-icons/fa";

/**
 * @component LikedSongs
 * @description Mostra todas as músicas com like dado pelo utilizador.
 * @returns {JSX.Element}
 */
export default function LikedSongs() {
    const { user } = useContext(AuthContext);
    const { playMusic, setQueue } = useContext(MusicContext);

    const [likedMusics, setLikedMusics] = useState([]);
    const [libraryIds, setLibraryIds] = useState([]);

    useEffect(() => {
        if (!user) return;

        api.get("/users/me/liked")
            .then((res) => setLikedMusics(res.data.data))
            .catch((err) => console.error("Erro ao obter likes:", err));

        api.get(`/users/${user._id}/library`)
            .then((res) => {
                const ids = res.data.data.map((m) => m._id);
                setLibraryIds(ids);
            })
            .catch((err) => console.error("Erro ao obter biblioteca:", err));
    }, [user]);

    const handleUnlike = (musicId) => {
        setLikedMusics((prev) => prev.filter((m) => m._id !== musicId));
    };

    const handlePlay = (selectedMusic) => {
        setQueue(likedMusics); // Atualiza a fila global
        playMusic(
            selectedMusic,
            likedMusics,
            likedMusics.findIndex((m) => m._id === selectedMusic._id)
        );
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold" style={{ color: "var(--text)" }}>
                    Músicas de que gostaste
                </h2>

                {likedMusics.length > 0 && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => {
                            setQueue(likedMusics);
                            playMusic(likedMusics[0], likedMusics, 0);
                        }}
                    >
                        <FaPlay />
                        Tocar Tudo
                    </button>
                )}
            </div>

            {likedMusics.length === 0 ? (
                <p className="muted">Ainda não gostaste de nenhuma música.</p>
            ) : (
                <ul className="list-unstyled d-flex flex-column gap-3">
                    {likedMusics.map((music) => (
                        <MusicListItem
                            key={music._id}
                            music={{
                                ...music,
                                isInLibrary: libraryIds.includes(music._id),
                            }}
                            userId={user._id}
                            onUpdate={() => handleUnlike(music._id)}
                            onPlay={() => handlePlay(music)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}