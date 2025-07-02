/**
 * @file ArtistDetail.jsx
 * @description
 * Página que apresenta os detalhes de um artista e os seus álbuns.
 * Mostra imagem, nome, bio e uma grelha de cartões de álbum.
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
    const { id } = useParams();               // ID do artista (URL param)
    const [artist, setArtist] = useState(null); // Dados completos do artista
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Vai buscar os dados do artista ao montar o componente
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

    // Carregamento ou erro
    if (loading) {
        return (
            <div className="container py-5">
                <p className="muted">A carregar artista...</p>
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center">{error || "Artista não encontrado."}</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Topo: Imagem, Nome, Bio */}
            <div className="d-flex flex-column flex-md-row align-items-center gap-4 mb-4">
                <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${artist.imageUrl}`}
                    alt={`Imagem de ${artist.name}`}
                    className="rounded shadow"
                    style={{ width: "160px", height: "160px", objectFit: "cover" }}
                />

                <div>
                    <h2 className="fw-semibold" style={{ color: "var(--text)" }}>
                        {artist.name}
                    </h2>
                    {artist.bio && (
                        <p className="muted mt-2" style={{ maxWidth: "600px" }}>
                            {artist.bio}
                        </p>
                    )}
                </div>
            </div>

            {/* Secção de álbuns */}
            <h4 className="fw-medium mb-3" style={{ color: "var(--text)" }}>
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