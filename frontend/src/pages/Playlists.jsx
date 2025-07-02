/**
 * @file Playlists.jsx
 * @description
 * Página que permite ao utilizador autenticado:
 * - Criar playlists novas
 * - Ver as playlists que já criou
 * - Editar o nome de cada playlist
 * - Apagar playlists
 */

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import api from "../services/axios";
import { Link } from "react-router-dom";
import getCsrfToken from "../utils/getCsrfToken";

// Ícones para botões
import { FaPen, FaTrashAlt, FaPlus } from "react-icons/fa";

/**
 * @component Playlists
 * Página onde o utilizador pode gerir as suas playlists.
 *
 * @returns {JSX.Element}
 */
export default function Playlists() {
    const { user } = useContext(AuthContext); // Utilizador autenticado
    const [playlists, setPlaylists] = useState([]); // Lista de playlists
    const [error, setError] = useState(null);       // Erro na requisição, se existir

    // Carrega playlists do utilizador
    useEffect(() => {
        if (!user) return;
        api
            .get(`/users/${user._id}/playlists`)
            .then((res) => setPlaylists(res.data.data))
            .catch((err) => {
                console.error("Erro ao obter playlists:", err);
                setError("Erro ao carregar as playlists.");
            });
    }, [user]);

    /**
     * @function handleCreatePlaylist
     * Cria uma nova playlist (nome introduzido por prompt).
     */
    const handleCreatePlaylist = async () => {
        const name = prompt("Nome da nova playlist:");
        if (!name) return;

        try {
            const token = await getCsrfToken();

            const res = await api.post(
                `/users/${user._id}/playlists`,
                { name: name.trim() },
                {
                    headers: { "X-CSRF-Token": token },
                }
            );

            setPlaylists((prev) => [...prev, res.data.data]);
        } catch (err) {
            console.error("Erro ao criar playlist:", err);
            toast.error("Erro ao criar playlist.");
        }
    };

    /**
     * @function handleEditPlaylist
     * Permite editar o nome de uma playlist existente.
     *
     * @param {string} playlistId - ID da playlist a editar
     * @param {string} currentName - Nome atual da playlist
     */
    const handleEditPlaylist = async (playlistId, currentName) => {
        const newName = prompt("Novo nome da playlist:", currentName);
        if (!newName || newName.trim() === currentName) return;

        try {
            await api.patch(`/users/${user._id}/playlists/${playlistId}`, {
                name: newName.trim(),
            });

            setPlaylists((prev) =>
                prev.map((pl) =>
                    pl._id === playlistId ? { ...pl, name: newName.trim() } : pl
                )
            );
        } catch (err) {
            console.error("Erro ao editar playlist:", err);
            toast.error("Erro ao editar playlist.");
        }
    };

    /**
     * @function handleDeletePlaylist
     * Apaga uma playlist após confirmação.
     *
     * @param {string} playlistId - ID da playlist a apagar
     */
    const handleDeletePlaylist = async (playlistId) => {
        const confirmDelete = window.confirm("Queres mesmo apagar esta playlist?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/users/${user._id}/playlists/${playlistId}`);
            setPlaylists((prev) => prev.filter((pl) => pl._id !== playlistId));
        } catch (err) {
            console.error("Erro ao apagar playlist:", err);
            toast.error("Erro ao apagar playlist.");
        }
    };

    return (
        <div className="container py-5">
            {/* Cabeçalho com título e botão para criar nova playlist */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold text-center flex-grow-1" style={{ color: "var(--text)" }}>
                    As Minhas Playlists
                </h2>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleCreatePlaylist}
                >
                    <FaPlus /> Criar Nova
                </button>
            </div>

            {/* Alerta de erro caso não consiga carregar playlists */}
            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            {/* Mensagem se não houver nenhuma playlist */}
            {playlists.length === 0 && !error && (
                <p className="text-center text-light">
                    Ainda não tens playlists criadas.
                </p>
            )}

            {/* Lista de playlists */}
            <div className="list-group shadow-sm">
                {playlists.map((pl) => (
                    <div
                        key={pl._id}
                        className="d-flex justify-content-between align-items-center p-3 mb-3"
                        style={{
                            backgroundColor: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "1rem",
                            color: "var(--text)",
                        }}
                    >
                        {/* Link para detalhe da playlist */}
                        <Link
                            to={`/playlists/${pl._id}`}
                            className="text-decoration-none flex-grow-1"
                            style={{ color: "var(--text)" }}
                        >
                            <strong>{pl.name}</strong>{" "}
                            <span className="muted">({pl.musics?.length || 0} músicas)</span>
                        </Link>

                        {/* Botões de editar e apagar */}
                        <div className="d-flex gap-2 ms-3">
                            <div className="tooltip-container">
                                <button
                                    className="btn-circle"
                                    onClick={() => handleEditPlaylist(pl._id, pl.name)}
                                >
                                    <FaPen />
                                </button>
                                <span className="tooltip-text">Editar</span>
                            </div>
                            <div className="tooltip-container">
                                <button
                                    className="btn-circle"
                                    onClick={() => handleDeletePlaylist(pl._id)}
                                >
                                    <FaTrashAlt />
                                </button>
                                <span className="tooltip-text">Apagar</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rodapé simples com mensagem */}
            <div className="text-center muted small mt-5">
                Organiza a tua música à tua maneira
            </div>
        </div>
    );
}