/**
 * @file ArtistDetail.jsx
 * @description
 * Página que apresenta os detalhes de um artista e os seus álbuns.
 * Mostra imagem, nome, bio, percurso, influências e factos.
 * Também apresenta os álbuns do artista como cartões.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/axios";
import AlbumCard from "../components/AlbumCard";

/**
 * @component ArtistDetail
 * @description
 * Página de detalhe de um artista, com imagem, bio e lista de álbuns.
 *
 * @returns {JSX.Element}
 */
export default function ArtistDetail() {
    const { id } = useParams();               // ID do artista na URL
    const [artist, setArtist] = useState(null); // Dados do artista
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carrega os dados do artista ao montar o componente
    useEffect(() => {
        if (!id) return;

        setLoading(true);

        api.get(`/artists/${id}`)
            .then((res) => {
                setArtist(res.data.data);
                document.title = res.data.data.name;
            })
            .catch((err) => {
                console.error("Erro ao carregar artista:", err);
                setError("Erro ao carregar os detalhes do artista.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Estado: a carregar
    if (loading) {
        return (
            <div className="container py-5">
                <p className="muted">A carregar artista...</p>
            </div>
        );
    }

    // Estado: erro ou artista não encontrado
    if (error || !artist) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center">
                    {error || "Artista não encontrado."}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Nome do artista */}
            <h2 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                {artist.name}
            </h2>

            {/* Linha com imagem + perfil */}
            <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
                {/* Esquerda: imagem */}
                <div style={{ flexShrink: 0 }}>
                    <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${artist.imageUrl}`}
                        alt={`Imagem de ${artist.name}`}
                        className="shadow"
                        style={{
                            width: "260px",
                            height: "260px",
                            objectFit: "cover",
                        }}
                    />
                </div>

                {/* Direita: dados artísticos */}
                <div className="flex-grow-1">
                    {artist.bio && (
                        <div className="mb-4">
                            <h6 className="fw-semibold" style={{ color: "var(--text)" }}>
                                Biografia
                            </h6>
                            <p className="muted mb-4">{artist.bio}</p>
                        </div>
                    )}

                    {artist.percurso && (
                        <div className="mb-4">
                            <h6 className="fw-semibold" style={{ color: "var(--text)" }}>
                                Percurso artístico
                            </h6>
                            <p className="muted mb-0">{artist.percurso}</p>
                        </div>
                    )}

                    {artist.influences?.length > 0 && (
                        <div className="mb-4">
                            <h6 className="fw-semibold" style={{ color: "var(--text)" }}>
                                Influências musicais
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                                {artist.influences.map((i, idx) => (
                                    <span
                                        key={idx}
                                        className="badge rounded-pill bg-secondary-subtle text-dark px-3 py-1"
                                    >
                                        {i}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {artist.facts?.length > 0 && (
                        <div>
                            <h6 className="fw-semibold" style={{ color: "var(--text)" }}>
                                Factos e curiosidades
                            </h6>
                            <ul className="ps-3 mb-0">
                                {artist.facts.map((f, idx) => (
                                    <li key={idx} className="muted small">
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Secção de álbuns */}
            <h4 className="fw-medium mt-5 mb-3" style={{ color: "var(--text)" }}>
                Álbuns
            </h4>

            {artist.albums.length === 0 ? (
                <p className="muted">Este artista ainda não tem álbuns publicados.</p>
            ) : (
                <div className="row g-4">
                    {artist.albums.map((album) => (
                        <div className="col-sm-6 col-md-4 col-lg-3" key={album._id}>
                            <AlbumCard
                                _id={album._id}
                                title={album.title}
                                coverUrl={album.coverUrl}
                                artistName={artist.name}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}