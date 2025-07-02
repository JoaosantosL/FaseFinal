/**
 * @file AlbumDetail.jsx
 * @description
 * Página de detalhes de um álbum.
 * Mostra a capa, título e lista de músicas.
 * Permite ao utilizador tocar todas as músicas do álbum.
 */

import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/axios";
import { AuthContext } from "../context/AuthContext";
import { MusicContext } from "../context/MusicContext";
import MusicListItem from "../components/MusicListItem";
import { FaPlay } from "react-icons/fa";

/**
 * @component AlbumDetail
 * @description
 * Página que apresenta as músicas de um álbum específico.
 * Acede a /api/albums/:id e mostra as músicas com `MusicListItem`.
 * 
 * @returns {JSX.Element}
 */
export default function AlbumDetail() {
    const { id } = useParams(); // ID do álbum obtido da URL
    const { user } = useContext(AuthContext);
    const { playMusic, setQueue } = useContext(MusicContext);

    const [album, setAlbum] = useState(null);       // Dados do álbum (título, capa, músicas)
    const [libraryIds, setLibraryIds] = useState([]); // IDs das músicas na biblioteca do user
    const [loading, setLoading] = useState(true);

    // Vai buscar os dados do álbum e da biblioteca
    useEffect(() => {
        if (!id || !user) return;

        setLoading(true);

        // 1. Pedido para obter o álbum
        api.get(`/albums/${id}`)
            .then((res) => {
                setAlbum(res.data.data);
                // Atualiza o título do separador (browser)
                document.title = res.data.data.title;
            })
            .catch((err) => {
                console.error("Erro ao carregar álbum:", err);
            });

        // 2. Pedido para obter a biblioteca do utilizador
        api.get(`/users/${user._id}/library`)
            .then((res) => {
                const ids = res.data.data.map((m) => m._id);
                setLibraryIds(ids);
            })
            .catch((err) => {
                console.error("Erro ao obter biblioteca:", err);
            })
            .finally(() => setLoading(false));
    }, [id, user]);

    // Tocar uma música específica
    const handlePlay = (selectedMusic) => {
        setQueue(album.musics); // Atualiza a fila global
        playMusic(
            selectedMusic,
            album.musics,
            album.musics.findIndex((m) => m._id === selectedMusic._id)
        );
    };

    // Interface em carregamento
    if (loading || !album) {
        return (
            <div className="container py-5">
                <p className="muted">A carregar álbum...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Título e capa do álbum */}
            <div className="d-flex align-items-center gap-4 mb-4">
                <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${album.coverUrl}`}
                    alt={album.title}
                    className="img-fluid rounded shadow"
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />

                <div>
                    <h2 className="fw-semibold" style={{ color: "var(--text)" }}>
                        {album.title}
                    </h2>

                    {album.musics.length > 0 && (
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2 mt-2"
                            onClick={() => {
                                setQueue(album.musics);
                                playMusic(album.musics[0], album.musics, 0);
                            }}
                        >
                            <FaPlay />
                            Tocar Tudo
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de músicas do álbum */}
            {album.musics.length === 0 ? (
                <p className="muted">Este álbum ainda não tem músicas.</p>
            ) : (
                <ul className="list-unstyled d-flex flex-column gap-3">
                    {album.musics.map((music) => (
                        <MusicListItem
                            key={music._id}
                            music={{
                                ...music,
                                isInLibrary: libraryIds.includes(music._id),
                            }}
                            userId={user._id}
                            onPlay={() => handlePlay(music)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}