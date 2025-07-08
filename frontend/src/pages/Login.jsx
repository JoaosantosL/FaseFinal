/**
 * @file Login.jsx
 * @description
 * Página de login da aplicação SoundDream.
 *
 * Permite ao utilizador iniciar sessão:
 * - Introduz email e password
 * - Recolhe token CSRF
 * - Envia os dados para o backend via POST
 * - Se autenticado, atualiza o AuthContext e redireciona para a homepage
 */

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";          // Redirecionamento após login
import { AuthContext } from "../context/AuthContext";     // Estado global da sessão
import api from "../services/axios";                      // Instância do Axios com cookies

/**
 * @component Login
 * Formulário de autenticação com proteção CSRF.
 *
 * @returns {JSX.Element}
 */
export default function Login() {
    const { setUser } = useContext(AuthContext);      // Atualiza o estado global
    const navigate = useNavigate();                   // Redireciona após login

    const [email, setEmail] = useState("");           // Estado do input email
    const [password, setPassword] = useState("");     // Estado do input password
    const [error, setError] = useState(null);         // Mensagem de erro, se houver

    /**
     * Envia as credenciais para o backend com token CSRF.
     * Em caso de sucesso, guarda o utilizador no contexto e redireciona.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita reload da página

        try {
            // Passo 1: obter token CSRF
            const { data } = await api.get("/csrf-token");

            // Passo 2: enviar pedido de login com o token CSRF
            await api.post(
                "/auth/login",
                { email, password },
                {
                    headers: {
                        "X-CSRF-Token": data.csrfToken,
                    },
                }
            );

            // Passo 3: guardar o utilizador no contexto global
            // Agora revalida a sessão para garantir que temos o _id
            const me = await api.get("/auth/me");
            setUser(me.data.data);

            // Passo 4: redirecionar para a homepage
            navigate("/");
        } catch (err) {
            console.error("Erro no login:", err);
            setError("Credenciais inválidas. Tente novamente.");
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: "500px" }}>
            {/* Título da página */}
            <h2 className="text-center mb-4" style={{ color: "var(--text)" }}>
                Iniciar Sessão
            </h2>

            {/* Alerta de erro */}
            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            {/* Formulário de login */}
            <form
                onSubmit={handleSubmit}
                className="p-4 rounded shadow"
                style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--hover)",
                }}
            >
                {/* Campo: Email */}
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

                {/* Campo: Password */}
                <div className="mb-4">
                    <label className="form-label text-light">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Botão de login */}
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                    Entrar
                </button>
            </form>

            {/* Mensagem para quem ainda não tem conta */}
            <div className="text-center muted small mt-4">
                Ainda não tens conta? Regista-te gratuitamente.
            </div>
        </div>
    );
}