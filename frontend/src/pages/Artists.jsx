/**
 * @file Artists.jsx
 * @description
 * Página que apresenta todos os artistas disponíveis na aplicação.
 * Mostra um cartão por artista com imagem e nome.
 * Ao clicar num artista, o utilizador é redirecionado para a página do artista (detalhe).
 */

import { useEffect, useState } from "react";
import api from "../services/axios";
import ArtistCard from "../components/ArtistCard";

/**
 * @component Artists
 * @description
 * Página de listagem de artistas.
 * Faz pedido a `/api/artists` e mostra cartões para cada um.
 *
 * @returns {JSX.Element}
 */
export default function Artists() {
    const [artists, setArtists] = useState([]);     // Lista de artistas
    const [error, setError] = useState(null);       // Mensagem de erro
    const [loading, setLoading] = useState(true);   // Estado de carregamento

    // Vai buscar os artistas ao montar o componente
    useEffect(() => {
        api.get("/artists")
            .then((res) => {
                setArtists(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao carregar artistas:", err);
                setError("Erro ao carregar a lista de artistas.");
                setLoading(false);
            });
    }, []);

    return (
        <div className="container py-5">
            <h2 className="fw-semibold text-center mb-4" style={{ color: "var(--text)" }}>
                Artistas
            </h2>

            {/* Mensagem de erro, se existir */}
            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            {/* Estado de carregamento */}
            {loading && (
                <div className="text-center muted fst-italic">
                    A carregar artistas...
                </div>
            )}

            {/* Grelha de artistas */}
            {!loading && artists.length > 0 && (
                <div className="row g-4">
                    {artists.map((artist) => (
                        <div className="col-sm-6 col-md-4 col-lg-3" key={artist._id}>
                            <ArtistCard
                                _id={artist._id}
                                name={artist.name}
                                imageUrl={artist.imageUrl}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Caso não haja artistas */}
            {!loading && artists.length === 0 && !error && (
                <p className="text-center muted">Nenhum artista encontrado.</p>
            )}
        </div>
    );
}