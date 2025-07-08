/**
 * @file Profile.jsx
 * @description
 * Página de perfil do utilizador com duas colunas:
 * - Lado esquerdo: dados, stats, tabs
 * - Lado direito: secção de músicas ouvidas (placeholder)
 * Em mobile: apenas mostra a coluna da esquerda.
 */

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios";
import getCsrfToken from "../utils/getCsrfToken";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import MusicListSimpleItem from "../components/MusicListSimpleItem";
import { MusicContext } from "../context/MusicContext";

export default function Profile() {
    const { user, setUser } = useContext(AuthContext);

    // Estados para edição do username
    const [username, setUsername] = useState(user.username);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [recent, setRecent] = useState([]);

    // Estado para estatísticas reais
    const [stats, setStats] = useState({
        musics: null,
        library: null,
        playlists: null,
    });
    const { playMusic } = useContext(MusicContext);
    /**
     * Atualiza o nome do utilizador
     */
    const handleSave = async () => {
        if (!username || username.trim().length < 3) {
            toast.warning("O username deve ter pelo menos 3 letras.");
            return;
        }

        setSaving(true);
        try {
            const csrfToken = await getCsrfToken();
            await api.patch(
                `/users/${user._id}/username`,
                { username: username.trim() },
                { headers: { "csrf-token": csrfToken } }
            );

            setUser((prev) => ({ ...prev, username: username.trim() }));
            toast.success("Nome de utilizador atualizado.");
            setIsEditing(false);
        } catch (err) {
            console.error("Erro ao guardar username:", err);
            toast.error("Erro ao atualizar o nome.");
        } finally {
            setSaving(false);
        }
    };

    /**
     * Carrega as estatísticas do utilizador autenticado
     */
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [resStats, resRecent] = await Promise.all([
                    api.get("/users/me/stats"),
                    api.get("/users/me/recent"),
                ]);
                setStats(resStats.data.data);
                setRecent(resRecent.data.data);
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="container py-5">
            <div className="row g-4">
                {/* ─────── COLUNA ESQUERDA ─────── */}
                <div className="col-md-6">
                    <h2 className="mb-4">Perfil</h2>

                    {/* Username editável */}
                    <div className="mb-3">
                        <label className="form-label">Nome de utilizador</label>
                        <div className="d-flex gap-2 align-items-center">
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                disabled={!isEditing}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {isEditing ? (
                                <>
                                    <button
                                        className="btn btn-primary d-flex align-items-center gap-2"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? "A guardar..." : "Guardar"}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            setUsername(user.username);
                                            setIsEditing(false);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Email (apenas leitura) */}
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <p className="muted mb-1">{user.email}</p>
                    </div>

                    {/* Data de registo */}
                    <div className="mb-4">
                        <label className="form-label">Registado desde</label>
                        <div className="fw-semibold">
                            {user.createdAt
                                ? new Date(user.createdAt).toISOString().split("T")[0]
                                : "Data indisponível"}
                        </div>
                    </div>

                    {/* Estatísticas reais */}
                    <h5 className="mt-5 mb-3">Estatísticas</h5>
                    <div className="stats-box">
                        <div className="stat-item">
                            <span className="label">Músicas ouvidas</span>
                            <span className="value">{stats.musics ?? "-"}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Na biblioteca</span>
                            <span className="value">{stats.library ?? "-"}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Playlists criadas</span>
                            <span className="value">{stats.playlists ?? "-"}</span>
                        </div>
                    </div>

                    {/* Link para perfil de artista, se aplicável */}
                    {user.role === "premium" && (
                        <div className="mt-5">
                            <h4 className="mb-3">Perfil Artístico</h4>
                            <p className="mb-2">
                                Como artista, tens um espaço dedicado para partilhares o teu percurso, gerires músicas e veres estatísticas.
                            </p>
                            <Link to="/artist-profile" className="btn btn-primary d-flex align-items-center gap-2">
                                Ver perfil artístico
                            </Link>
                        </div>
                    )}
                </div>

                {/* ─────── COLUNA DIREITA: Músicas ouvidas ─────── */}
                <div className="col-md-6 d-none d-md-block">
                    <h4 className="mb-3">Músicas ouvidas recentemente</h4>

                    {recent.length === 0 ? (
                        <div
                            className="p-4 rounded"
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--hover)",
                            }}
                        >
                            <p className="muted mb-0">
                                Ainda não ouviste nenhuma música. Dá o play na tua primeira faixa!
                            </p>
                        </div>
                    ) : (
                        <ul className="list-unstyled d-flex flex-column gap-3">
                            {recent.map((music, index) => (
                                <MusicListSimpleItem
                                    key={music._id}
                                    music={music}
                                    onPlay={() => playMusic(music, recent, index)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}