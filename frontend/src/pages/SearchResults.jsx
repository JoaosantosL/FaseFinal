/**
 * @file SearchResults.jsx
 * @description
 * Página que mostra resultados da pesquisa global:
 * - Se for artista → mostra artista + álbuns + músicas
 * - Se for álbum → mostra álbum + músicas
 * - Se for título de música → mostra músicas
 */

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/axios";
import MusicCard from "../components/MusicCard";

/**
 * @component SearchResults
 * @description
 * Renderiza resultados conforme o tipo (artista, álbum ou música).
 *
 * @returns {JSX.Element}
 */
export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");

    // Estado para guardar o tipo de resultado (musica, album, artista)
    const [context, setContext] = useState("");

    // Dados para renderização
    const [musics, setMusics] = useState([]);
    const [artist, setArtist] = useState(null); // nome + imagem
    const [albums, setAlbums] = useState([]);
    const [album, setAlbum] = useState(null); // nome do álbum (caso único)

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) return;

        setLoading(true);

        // Chamada à API /search?q=...
        api.get(`/search?q=${encodeURIComponent(query)}`)
            .then((res) => {
                const data = res.data;
                setContext(data.context || "");

                // Atualiza os dados conforme o contexto
                switch (data.context) {
                    case "artista":
                        setArtist(data.artista);
                        setAlbums(data.albums || []);
                        setMusics(data.musics || []);
                        break;
                    case "album":
                        setAlbum(data.album);
                        setMusics(data.musics || []);
                        break;
                    case "musica":
                    default:
                        setMusics(data.musics || []);
                        break;
                }
            })
            .catch((err) => {
                console.error("Erro ao carregar resultados:", err);
            })
            .finally(() => setLoading(false));
    }, [query]);

    return (
        <div className="container py-5">
            {/* Cabeçalho da pesquisa */}
            <h2 className="mb-4 fw-semibold text-center mb-3" style={{ color: "var(--text)" }}>
                Resultados para: <em>{query}</em>
            </h2>

            {/* Se estiver a carregar, mostra spinner */}
            {loading ? (
                <p className="muted">A procurar...</p>
            ) : (
                <>
                    {/* Se for artista, mostra nome + imagem */}
                    {context === "artista" && artist && (
                        <>
                            <h4 className="mt-4 mb-3">Artistas</h4>
                            <h3 className="fw-bold">{artist.name}</h3>
                            {artist.imageUrl && (
                                <img
                                    src={`${process.env.REACT_APP_BACKEND_URL}${artist.imageUrl}`}
                                    alt={artist.name}
                                    className="img-fluid rounded shadow"
                                    style={{ maxHeight: "200px" }}
                                />
                            )}
                        </>
                    )}

                    {/* Se for álbum, mostra nome e (opcionalmente) imagem */}
                    {context === "album" && album && (
                        <>
                            <h4 className="mt-4 mb-3">Albums</h4>
                            <h3 className="fw-bold">{album.title}</h3>
                            {album.coverUrl && (
                                <img
                                    src={`${process.env.REACT_APP_BACKEND_URL}${album.coverUrl}`}
                                    alt={album.title}
                                    className="img-fluid rounded shadow"
                                    style={{ maxHeight: "200px" }}
                                />
                            )}
                        </>
                    )}

                    {/* Secção de músicas */}
                    {musics.length > 0 && (
                        <>
                            <h4 className="mt-4 mb-3">Músicas</h4>
                            <div className="row g-3">
                                {musics.map((music) => (
                                    <div key={music._id} className="col-sm-6 col-md-4">
                                        <MusicCard {...music} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Secção de álbuns (caso venha do artista) */}
                    {context === "artista" && albums.length > 0 && (
                        <>
                            <h4 className="mt-4 mb-3">Álbuns</h4>
                            <div className="row g-3">
                                {albums.map((alb) => (
                                    <div key={alb._id} className="col-sm-6 col-md-4 text-center">
                                        <Link to={`/albums/${alb._id}`} className="text-decoration-none text-reset">
                                            <h5 className="fw-semibold">{alb.title}</h5>
                                            {alb.coverUrl && (
                                                <img
                                                    src={`${process.env.REACT_APP_BACKEND_URL}${alb.coverUrl}`}
                                                    alt={alb.title}
                                                    className="img-fluid rounded shadow"
                                                    style={{ maxHeight: "160px" }}
                                                />
                                            )}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Sem resultados */}
                    {musics.length === 0 && albums.length === 0 && !artist && !album && (
                        <p className="muted">Sem resultados encontrados.</p>
                    )}
                </>
            )}
        </div>
    );
}