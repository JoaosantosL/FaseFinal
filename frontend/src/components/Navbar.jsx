/**
 * @file Navbar.jsx
 * @description
 * Componente de navegação principal da aplicação SoundDream.
 * Mostra diferentes opções consoante o estado de autenticação.
 * Integra com o AuthContext para saber se o utilizador está autenticado
 * e usa React Router para navegar entre páginas.
 */

import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios";

/**
 * @component Navbar
 * @description
 * Barra de navegação com links diferentes consoante o estado de autenticação.
 * - Se o utilizador estiver autenticado: mostra biblioteca, playlists, gostadas e logout
 * - Se não estiver autenticado: mostra login e registo
 *
 * @returns {JSX.Element}
 */
export default function Navbar() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false); // estado do menu mobile


    /**
     * Termina a sessão do utilizador:
     * - Vai buscar o token CSRF
     * - Envia pedido POST para logout
     * - Limpa o utilizador do estado global
     * - Redireciona para a página de login
     */
    const handleLogout = async () => {
        try {
            const { data } = await api.get("/csrf-token");

            await api.post("/auth/logout", {}, {
                headers: { "X-CSRF-Token": data.csrfToken },
            });

            setUser(null);
            navigate("/login");
        } catch (err) {
            console.error("Erro ao fazer logout", err);
            toast.error("Erro ao terminar sessão.");
        }
    };

    return (
        <nav
            className="navbar navbar-expand-lg px-4 shadow-sm"
            style={{
                backgroundColor: "var(--bg-card)",
                borderBottom: "1px solid var(--hover)",
            }}
        >
            <div className="container-fluid">
                {/* Logótipo */}
                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                    style={{ color: "var(--text)", fontSize: "1.5rem" }}
                >
                    SoundDream
                </Link>

                {/* Botão de toggle (mobile) */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    style={{
                        backgroundColor: "transparent",
                        border: "none",
                        fontSize: "1.6rem",
                        color: "var(--text)",
                    }}
                    aria-label="Alternar menu"
                >
                    {isOpen ? "✖" : "☰"}
                </button>

                {/* Links (mostra/esconde consoante isOpen) */}
                <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center gap-3 flex-column flex-lg-row text-end text-lg-start">
                        <li className="nav-item">
                            <Link className="nav-link" style={{ color: "var(--text)" }} to="/" onClick={() => setIsOpen(false)}>
                                Home
                            </Link>
                        </li>
                        {/* Link para todos os utilizadores */}
                        <li className="nav-item">
                            <Link className="nav-link" style={{ color: "var(--text)" }} to="/artists" onClick={() => setIsOpen(false)}>
                                Artistas
                            </Link>
                        </li>
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: "var(--text)" }} to="/library" onClick={() => setIsOpen(false)}>
                                        Biblioteca
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: "var(--text)" }} to="/playlists" onClick={() => setIsOpen(false)}>
                                        Playlists
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: "var(--text)" }} to="/gostadas" onClick={() => setIsOpen(false)}>
                                        Favoritas
                                    </Link>
                                </li>
                                <li className="nav-item small fst-italic" style={{ color: "var(--text)" }}>
                                    Olá, <span className="fw-semibold">{user.username}</span>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-sm btn-outline-light rounded-pill"
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: "var(--text)" }} to="/login" onClick={() => setIsOpen(false)}>
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: "var(--text)" }} to="/register" onClick={() => setIsOpen(false)}>
                                        Registar
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}