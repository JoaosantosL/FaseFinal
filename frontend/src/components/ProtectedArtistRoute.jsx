/**
 * @file ProtectedArtistRoute.jsx
 * @description
 * Componente que protege rotas apenas acessíveis a utilizadores com o papel "artist".
 * Se o utilizador não estiver autenticado ou não for um artista, redireciona
 * para a página de login ou para a página inicial, respetivamente.
 */
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * @component ProtectedArtistRoute
 * @description
 * Rota protegida apenas acessível a utilizadores com o papel "artist".
 */
export default function ProtectedArtistRoute({ children }) {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) return null; // ou spinner

    // Não autenticado
    if (!user) return <Navigate to="/login" />;

    // Autenticado mas não é artista
    if (user.role !== "artist") return <Navigate to="/" />;

    return children;
}