/**
 * @file ArtistAlbumManager.jsx
 * @description
 * Componente que permite ao artista visualizar os seus álbuns e músicas.
 * Permite também criar novos álbuns e fazer upload de músicas através de modais.
 */

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import MusicListItemInfoOnly from "./MusicListItemInfoOnly";
import getCsrfToken from "../utils/getCsrfToken";

export default function ArtistAlbumManager() {
    const { user } = useContext(AuthContext);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [newAlbumTitle, setNewAlbumTitle] = useState("");
    const [newReleaseDate, setNewReleaseDate] = useState("");
    const [newCoverFile, setNewCoverFile] = useState(null);

    const [showMusicModal, setShowMusicModal] = useState(false);
    const [newMusicTitle, setNewMusicTitle] = useState("");
    const [newMusicCover, setNewMusicCover] = useState(null);
    const [newMusicFile, setNewMusicFile] = useState(null);
    const [newMusicAlbumId, setNewMusicAlbumId] = useState("");

    useEffect(() => {
        async function fetchArtistAlbums() {
            try {
                const res = await api.get("/artists/me");
                setAlbums(res.data.data.albums || []);
                res.data.data.albums.forEach(album => {
                    console.log("Músicas do álbum:", album.musics);
                });
            } catch (err) {
                toast.error("Erro ao carregar álbuns do artista");
            } finally {
                setLoading(false);
            }
        }

        fetchArtistAlbums();
    }, []);

    const handleCreateAlbum = async () => {
        if (!newAlbumTitle.trim()) {
            toast.warning("O título do álbum é obrigatório");
            return;
        }

        if (!newCoverFile) {
            toast.warning("A imagem de capa é obrigatória");
            return;
        }

        try {
            const token = await getCsrfToken();
            const formData = new FormData();

            formData.append("title", newAlbumTitle);
            if (newReleaseDate) formData.append("releaseDate", newReleaseDate);
            formData.append("cover", newCoverFile);

            const res = await api.post(
                `/artists/${user.linkedArtist}/albums`,
                formData,
                {
                    headers: {
                        "X-CSRF-Token": token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setAlbums((prev) => [...prev, res.data.data]);
            toast.success("Álbum criado com sucesso!");
            setShowAlbumModal(false);
            setNewAlbumTitle("");
            setNewReleaseDate("");
            setNewCoverFile(null);
        } catch (err) {
            toast.error("Erro ao criar álbum");
        }
    };

    const handleUploadMusic = async () => {
        if (!newMusicTitle.trim() || !newMusicCover || !newMusicFile) {
            toast.warning("Preenche todos os campos obrigatórios");
            return;
        }

        try {
            const token = await getCsrfToken();
            const formData = new FormData();
            formData.append("title", newMusicTitle);
            formData.append("cover", newMusicCover);
            formData.append("audio", newMusicFile);
            if (newMusicAlbumId) formData.append("album", newMusicAlbumId);

            const res = await api.post(
                `/artists/${user.linkedArtist}/musics`,
                formData,
                {
                    headers: {
                        "X-CSRF-Token": token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newMusic = res.data.data;

            // Atualiza o estado do álbum correspondente com a nova música
            if (newMusic.album) {
                setAlbums((prevAlbums) =>
                    prevAlbums.map((album) =>
                        album._id === newMusic.album
                            ? {
                                ...album,
                                musics: [...(album.musics || []), newMusic],
                            }
                            : album
                    )
                );
            }

            toast.success("Música enviada com sucesso!");
            setShowMusicModal(false);
            setNewMusicTitle("");
            setNewMusicCover(null);
            setNewMusicFile(null);
            setNewMusicAlbumId("");
        } catch (err) {
            toast.error("Erro ao enviar música");
        }
    };

    return (
        <div className="container py-4">
            {/* Botões de ação */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => setShowAlbumModal(true)}
                    >
                        <FaPlus /> Criar álbum
                    </button>
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => setShowMusicModal(true)}
                    >
                        <FaPlus /> Upload de música
                    </button>
                </div>
            </div>

            {/* Lista de álbuns */}
            {loading ? (
                <p>A carregar álbuns...</p>
            ) : albums.length === 0 ? (
                <p className="text-muted">Ainda não tens álbuns criados.</p>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {albums.map((album) => (
                        <div
                            key={album._id}
                            className="p-4 rounded"
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--hover)",
                            }}
                        >
                            <h5 className="mb-3">{album.title} ({album.musics?.length || 0} músicas)</h5>

                            {album.musics?.length > 0 ? (
                                <ul className="list-unstyled d-flex flex-column gap-3">
                                    {album.musics.map((music) => (
                                        <MusicListItemInfoOnly key={music._id} music={music} />
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted mb-0">Este álbum ainda não tem músicas.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de criação de álbum */}
            {showAlbumModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Criar novo álbum</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAlbumModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Título do álbum</label>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    value={newAlbumTitle}
                                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                                />

                                <label className="form-label">Data de lançamento (opcional)</label>
                                <input
                                    type="date"
                                    className="form-control mb-3"
                                    value={newReleaseDate}
                                    onChange={(e) => setNewReleaseDate(e.target.value)}
                                />

                                <label className="form-label">Imagem de capa (obrigatória)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={(e) => setNewCoverFile(e.target.files[0])}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAlbumModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateAlbum}
                                >
                                    Criar álbum
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de upload de música */}
            {showMusicModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Upload de Música</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowMusicModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Título da música</label>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    value={newMusicTitle}
                                    onChange={(e) => setNewMusicTitle(e.target.value)}
                                />

                                <label className="form-label">Capa da música</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control mb-3"
                                    onChange={(e) => setNewMusicCover(e.target.files[0])}
                                />

                                <label className="form-label">Ficheiro de áudio (.mp3)</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="form-control mb-3"
                                    onChange={(e) => setNewMusicFile(e.target.files[0])}
                                />

                                <label className="form-label">Associar a álbum (opcional)</label>
                                <select
                                    className="form-select"
                                    value={newMusicAlbumId}
                                    onChange={(e) => setNewMusicAlbumId(e.target.value)}
                                >
                                    <option value="">Nenhum</option>
                                    {albums.map((album) => (
                                        <option key={album._id} value={album._id}>
                                            {album.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowMusicModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUploadMusic}
                                >
                                    Enviar música
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}