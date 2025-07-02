/**
 * @file Register.jsx
 * @description
 * Página de registo de novos utilizadores na aplicação SoundDream.
 * Envia os dados para `POST /api/auth/register`, com token CSRF no header.
 * Em caso de sucesso:
 *  - Atualiza o AuthContext (`setUser`)
 *  - Redireciona automaticamente para a homepage autenticada `/`
 */

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios"; // Axios já configurado com withCredentials

/**
 * @component Register
 * @description
 * Formulário de registo de utilizadores com proteção CSRF.
 *
 * @returns {JSX.Element}
 */
export default function Register() {
    const { setUser } = useContext(AuthContext); // Função para atualizar o estado global com o utilizador autenticado
    const navigate = useNavigate();              // Permite redirecionar para outra rota (pós-registo)

    // Estados controlados dos campos de input
    const [username, setUsername] = useState(""); // Nome de utilizador
    const [email, setEmail] = useState("");       // Email de login
    const [password, setPassword] = useState(""); // Password
    const [error, setError] = useState(null);     // Mensagem de erro, caso falhe

    /**
     * @function handleSubmit
     * Envia os dados para o backend com proteção CSRF e trata o resultado.
     *
     * @param {React.FormEvent} e - Evento de submissão do formulário
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Impede recarregamento da página

        try {
            // 1. Obtemos o token CSRF
            const { data } = await api.get("/csrf-token");

            // 2. Enviamos o pedido de registo
            await api.post(
                "/auth/register",
                { username, email, password },
                {
                    headers: {
                        "X-CSRF-Token": data.csrfToken,
                    },
                }
            );

            // 3. Guardamos o utilizador no contexto global
            const me = await api.get("/auth/me");
            setUser(me.data.data);

            // 4. Redirecionamos para a homepage
            navigate("/");
        } catch (err) {
            console.error("Erro no registo:", err);
            setError("Erro ao criar conta. Verifique os dados ou tente outro email.");
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: "500px" }}>
            {/* Título da página */}
            <h2 className="text-center mb-4" style={{ color: "var(--text)" }}>
                Criar Conta
            </h2>

            {/* Alerta visual para erros */}
            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            {/* Formulário controlado */}
            <form
                onSubmit={handleSubmit}
                className="p-4 rounded shadow"
                style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--hover)",
                }}
            >
                {/* Campo: Nome de utilizador */}
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
                        minLength={6}
                    />
                </div>

                {/* Botão de submissão */}
                <button type="submit" className="btn btn-success w-100 shadow-sm">
                    Criar Conta
                </button>
            </form>

            {/* Link para login */}
            <div className="text-center muted small mt-4">
                Já tens conta? Inicia sessão agora.
            </div>
        </div>
    );
}