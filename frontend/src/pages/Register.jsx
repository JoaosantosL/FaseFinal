/**
 * @file Register.jsx
 * @description
 * Página de registo de novos utilizadores na aplicação SoundDream.
 * Envia os dados para `POST /api/auth/register`, com token CSRF no header.
 * Se o registo for bem-sucedido:
 *  - Atualiza o AuthContext (`setUser`)
 *  - Redireciona automaticamente para a homepage autenticada `/`
 */

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios";

/**
 * @component Register
 * @description
 * Formulário de registo de utilizadores com proteção CSRF.
 *
 * @returns {JSX.Element}
 */
export default function Register() {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Campos base
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    // Role: base, pro ou artist
    const [role, setRole] = useState("base");

    // Campos adicionais para artistas
    const [artistName, setArtistName] = useState("");
    const [isPortuguese, setIsPortuguese] = useState(false);

    /**
     * @function handleSubmit
     * Envia os dados do formulário com proteção CSRF.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await api.get("/csrf-token");

            // Payload condicional com campos de artista se role === "artist"
            await api.post(
                "/auth/register",
                {
                    username,
                    email,
                    password,
                    role,
                    ...(role === "artist" && {
                        artistName,
                        isPortuguese,
                    }),
                },
                {
                    headers: { "X-CSRF-Token": data.csrfToken },
                }
            );

            const me = await api.get("/auth/me");
            setUser(me.data.data);
            navigate("/");
        } catch (err) {
            console.error("Erro no registo:", err);
            setError("Erro ao criar conta. Verifique os dados ou tente outro email.");
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: "500px" }}>
            <h2 className="text-center mb-4" style={{ color: "var(--text)" }}>
                Criar Conta
            </h2>

            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="p-4 rounded shadow"
                style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--hover)",
                }}
            >
                {/* Nome de utilizador */}
                <div className="mb-3">
                    <label className="form-label text-light">Nome de utilizador</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="joaosilva"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-3">
                    <label className="form-label text-light">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className="form-label text-light">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {/* Seleção de Plano */}
                <div className="mb-4">
                    <label className="form-label text-light">Tipo de Conta</label>
                    <div className="d-flex flex-column gap-2">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="accountType"
                                id="baseAccount"
                                checked={role === "base"}
                                onChange={() => setRole("base")}
                            />
                            <label className="form-check-label text-light" htmlFor="baseAccount">
                                <strong>Base</strong> - Acesso básico gratuito
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="accountType"
                                id="proAccount"
                                checked={role === "pro"}
                                onChange={() => setRole("pro")}
                            />
                            <label className="form-check-label text-light" htmlFor="proAccount">
                                <strong>Pro</strong> - Acesso completo (assinar depois)
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="accountType"
                                id="artistAccount"
                                checked={role === "artist"}
                                onChange={() => setRole("artist")}
                            />
                            <label className="form-check-label text-light" htmlFor="artistAccount">
                                <strong>Artista</strong> - Para criadores de conteúdo
                            </label>
                        </div>
                    </div>
                </div>

                {/* Nome artístico (se artista) */}
                {role === "artist" && (
                    <>
                        <div className="mb-3">
                            <label className="form-label text-light">Nome artístico</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ex: João Silva"
                                value={artistName}
                                onChange={(e) => setArtistName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Checkbox: artista português */}
                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="isPortuguese"
                                checked={isPortuguese}
                                onChange={(e) => setIsPortuguese(e.target.checked)}
                            />
                            <label className="form-check-label text-light" htmlFor="isPortuguese">
                                És um artista português?
                            </label>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2 w-100 justify-content-center"
                >
                    Criar Conta
                </button>
            </form>

            <div className="text-center muted small mt-4">
                Já tens conta? <a href="/login" className="text-accent">Inicia sessão agora</a>.
            </div>
        </div>
    );
}