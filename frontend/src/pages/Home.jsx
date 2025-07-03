/**
 * @file Home.jsx
 * @description
 * Página principal da aplicação SoundDream.
 * Apresenta:
 * - Sugestões personalizadas (via IA)
 * - Playlists pessoais do utilizador
 * - Repositório global de músicas (ordenado por popularidade)
 */

import { useContext, useEffect, useState } from "react";
import api from "../services/axios";
import MusicCard from "../components/MusicCard";
import { AuthContext } from "../context/AuthContext";

/**
 * @component Home
 * @description
 * Página de entrada após o login. Mostra:
 * - Sugestões com base na IA
 * - Playlists do utilizador
 * - Lista completa de músicas (ordenada por popularidade)
 *
 * @returns {JSX.Element}
 */
export default function Home() {
    const { user } = useContext(AuthContext); // Dados do utilizador autenticado

    const [musics, setMusics] = useState([]);           // Todas as músicas disponíveis
    const [recomendadas, setRecomendadas] = useState([]); // Sugestões geradas pela IA
    const [playlists, setPlaylists] = useState([]);     // Playlists do utilizador
    const [libraryIds, setLibraryIds] = useState([]);   // IDs das músicas na biblioteca
    const [error, setError] = useState(null);           // Mensagem de erro, se existir

    // Carrega dados ao montar o componente
    useEffect(() => {
        // 1️⃣ Pedir todas as músicas disponíveis
        api.get("/music")
            .then((res) => {
                const ordenadas = res.data.data.sort((a, b) => b.plays - a.plays);
                setMusics(ordenadas);
            })
            .catch((err) => {
                console.error("Erro ao obter músicas:", err);
                setError("Erro ao carregar músicas.");
            });

        // 2️⃣ Se o utilizador estiver autenticado, carregar dados pessoais
        if (user) {
            // Biblioteca pessoal
            api.get(`/users/${user._id}/library`)
                .then((res) => {
                    const ids = res.data.data.map((m) => m._id);
                    setLibraryIds(ids);
                })
                .catch((err) => {
                    console.error("Erro ao obter biblioteca:", err);
                });

            // Playlists pessoais
            api.get(`/users/${user._id}/playlists`)
                .then((res) => setPlaylists(res.data.data))
                .catch((err) => {
                    console.error("Erro ao obter playlists:", err);
                });

            // Sugestões da IA (via backend)
            api.get("/recommendation/me")
                .then((res) => {
                    setRecomendadas(res.data.data);
                })
                .catch((err) => {
                    console.error("Erro ao obter sugestões personalizadas:", err);
                    setRecomendadas([]);
                });
        }
    }, [user]);

    // 3️⃣ IDs das sugestões da IA — para excluir da lista global
    const idsSugestoes = (recomendadas || []).map((m) => m._id);

    // 4️⃣ Músicas restantes (exclui as sugeridas), ordenadas por popularidade
    const restantes = musics
        .filter((m) => !idsSugestoes.includes(m._id))
        .sort((a, b) => b.plays - a.plays);

    return (
        <div className="container py-5">
            {/* 1️⃣ Secção: Sugestões Personalizadas */}
            <h2 className="mb-3 fw-semibold" style={{ color: "var(--text)" }}>
                As nossas sugestões
            </h2>
            <div className="row g-4 mb-5">
                {recomendadas.length === 0 ? (
                    <div className="col-12">
                        <p className="muted fst-italic text-center">
                            Ainda não temos sugestões personalizadas. Dá like em algumas músicas ou adiciona à tua biblioteca!
                        </p>
                    </div>
                ) : (
                    recomendadas.map((music) => (
                        <div className="col-sm-6 col-md-4" key={music._id}>
                            <MusicCard
                                {...music}
                                isInLibrary={libraryIds.includes(music._id)}
                                allowAddToPlaylist={true}
                                musicList={recomendadas}
                                onLibraryChange={(action, musicId) => {
                                    setLibraryIds((prev) =>
                                        action === "add"
                                            ? [...prev, musicId]
                                            : prev.filter((id) => id !== musicId)
                                    );
                                }}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* 2️⃣ Secção: Playlists Pessoais */}
            {user && (
                <div className="mb-5 d-flex flex-wrap gap-3">
                    {playlists.length === 0 ? (
                        <span className="muted">Nenhuma playlist criada ainda.</span>
                    ) : (
                        playlists.map((pl) => (
                            <a
                                key={pl._id}
                                href={`/playlists/${pl._id}`}
                                className="btn btn-sm btn-outline-light"
                            >
                                {pl.name}
                            </a>
                        ))
                    )}
                </div>
            )}

            {/* 3️⃣ Mensagens de erro ou carregamento */}
            {error && (
                <div className="alert alert-danger text-center fw-medium shadow-sm">
                    {error}
                </div>
            )}

            {musics.length === 0 && !error && (
                <div className="text-center muted fst-italic">
                    A carregar músicas...
                </div>
            )}

            {/* 4️⃣ Secção: Todas as músicas (exceto as sugeridas) */}
            <div className="row g-4">
                {restantes.map((music) => (
                    <div className="col-sm-6 col-md-4" key={music._id}>
                        <MusicCard
                            {...music}
                            isInLibrary={libraryIds.includes(music._id)}
                            allowAddToPlaylist={true}
                            onLibraryChange={(action, musicId) => {
                                setLibraryIds((prev) =>
                                    action === "add"
                                        ? [...prev, musicId]
                                        : prev.filter((id) => id !== musicId)
                                );
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* 5️⃣ Rodapé */}
            <footer className="text-center mt-5 text-muted small">
                <hr className="text-secondary" />
                <span className="d-block muted">SoundDream © {new Date().getFullYear()}</span>
                <span className="fst-italic muted">Música para todos</span>
            </footer>
        </div>
    );
}