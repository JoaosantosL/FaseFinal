import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * @component SearchBar
 * @description
 * Input de pesquisa global com botão de envio.
 * Redireciona para a rota /pesquisa?query=...
 * Só aparece se o user não estiver na página de login ou registo.
 *
 * @returns {JSX.Element}
 */
export default function SearchBar() {
    const [query, setQuery] = useState("");           // Estado local para o texto
    const navigate = useNavigate();                   // Para redirecionar ao pesquisar
    const location = useLocation();                   // Para saber a rota atual

    // Rota atual é de autenticação? Então não mostra a barra
    const isHidden = ["/login", "/register"].includes(location.pathname);
    if (isHidden) return null;

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