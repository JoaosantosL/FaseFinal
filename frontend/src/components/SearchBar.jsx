import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * @component SearchBar
 * @description
 * Input de pesquisa global com botão de envio.
 * Redireciona para a rota /pesquisa?query=...
 *
 * @returns {JSX.Element}
 */
export default function SearchBar() {
    const [query, setQuery] = useState("");           // Estado local para o texto
    const navigate = useNavigate();                   // Para redirecionar ao pesquisar

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!query.trim()) return;                    // Evita pesquisas vazias

        navigate(`/pesquisa?query=${encodeURIComponent(query.trim())}`);
        setQuery("");                                 // Limpa o input após pesquisa
    };

    return (
        <div className="container py-3">
            <form onSubmit={handleSubmit} className="d-flex justify-content-center">
                <input
                    type="text"
                    className="form-control w-100 w-md-50"
                    style={{ maxWidth: "500px" }}
                    placeholder="Pesquisar músicas, artistas ou álbuns..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>
        </div>
    );
}