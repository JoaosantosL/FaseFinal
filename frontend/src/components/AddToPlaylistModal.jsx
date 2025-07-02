/**
 * @file AddToPlaylistModal.jsx
 * @description
 * Modal que permite ao utilizador adicionar uma música a uma das suas playlists existentes.
 * Mostra um `<select>` com as playlists disponíveis e um botão para confirmar a adição.
 * Utiliza CSRF token para segurança no PATCH.
 */

import { useEffect, useState } from "react";
import api from "../services/axios"; // Axios com interceptors e withCredentials
import getCsrfToken from "../utils/getCsrfToken"; // Função auxiliar para obter o token CSRF
import { toast } from "react-toastify";

/**
 * @component AddToPlaylistModal
 * @description
 * Componente modal que permite ao utilizador escolher uma playlist
 * e adicionar-lhe uma música (usando PATCH via Axios).
 *
 * @param {Object} props
 * @param {string} props.userId - ID do utilizador autenticado
 * @param {string} props.musicId - ID da música a adicionar
 * @param {string} props.title - Título da música (para exibir no modal)
 * @param {Function} props.onClose - Função chamada ao fechar (com `true` se sucesso, `false` se erro/cancelar)
 *
 * @returns {JSX.Element}
 */
export default function AddToPlaylistModal({ userId, musicId, title, onClose }) {
    // Lista de playlists do utilizador
    const [playlists, setPlaylists] = useState([]);

    // ID da playlist selecionada
    const [selectedId, setSelectedId] = useState(null);

    // Estado de carregamento para mostrar feedback enquanto se obtêm os dados
    const [loading, setLoading] = useState(true);

    /**
     * Quando o modal é aberto, faz uma chamada GET para obter as playlists do utilizador.
     * Se houver erro, mostra um toast. Quando termina (com sucesso ou erro), desativa o loading.
     */
    useEffect(() => {
        api.get(`/users/${userId}/playlists`)
            .then((res) => setPlaylists(res.data.data))
            .catch((err) => {
                console.error("Erro ao obter playlists:", err);
                toast.error("Erro ao carregar playlists.");
            })
            .finally(() => setLoading(false));
    }, [userId]);

    /**
     * Envia pedido PATCH para adicionar a música à playlist selecionada.
     * Usa CSRF token para segurança.
     * Se sucesso: chama onClose(true), se erro: chama onClose(false)
     */
    const handleConfirm = async () => {
        if (!selectedId) return;

        try {
            const token = await getCsrfToken();

            await api.patch(
                `/users/${userId}/playlists/${selectedId}`,
                { musicId },
                { headers: { "X-CSRF-Token": token } }
            );

            // Fechar modal com sucesso
            onClose(true);
        } catch (err) {
            console.error("Erro ao adicionar à playlist:", err);
            toast.error("Erro ao adicionar música.");
            onClose(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h5>Adicionar "{title}" à Playlist</h5>

                {/* Se ainda estiver a carregar playlists, mostra mensagem de espera */}
                {loading ? (
                    <p>A carregar playlists...</p>
                ) : playlists.length === 0 ? (
                    <p>Nenhuma playlist encontrada.</p>
                ) : (
                    // Lista de playlists para o utilizador escolher
                    <select
                        className="form-select mt-3"
                        value={selectedId || ""}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        <option value="" disabled>
                            Escolhe uma playlist...
                        </option>
                        {playlists.map((pl) => (
                            <option key={pl._id} value={pl._id}>
                                {pl.name}
                            </option>
                        ))}
                    </select>
                )}

                {/* Botões de ação: cancelar ou confirmar */}
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => onClose(false)}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConfirm}
                        disabled={!selectedId}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}