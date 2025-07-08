/**
 * @file App.jsx
 * @description
 * Componente principal da aplicação SoundDream.
 * Define as rotas públicas e protegidas, e carrega a Navbar e o MusicPlayer
 * em todas as páginas. Usa o AuthContext para proteger o acesso a páginas
 * reservadas a utilizadores autenticados.
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";

// Biblioteca de toasts para mensagens rápidas no ecrã
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Componentes comuns
import Navbar from "./components/Navbar";
import MusicPlayer from "./components/MusicPlayer";

import ProtectedArtistRoute from "./components/ProtectedArtistRoute";

// Páginas principais da aplicação
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import LikedSongs from "./pages/LikedSongs";
import SearchBar from "./components/SearchBar";
import SearchResults from "./pages/SearchResults";
import AlbumDetail from "./pages/AlbumDetail";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";
import ChatbotPlaylist from "./pages/ChatbotPlaylist";
import Profile from "./pages/Profile";
import ArtistProfile from "./pages/ArtistProfile";
import ChatbotToggleButton from "./components/ChatbotToggleButton";
import ArtistChatbot from "./components/ArtistChatbot";

import HomeShow from "./pages/HomeShow";
import Contato from "./pages/Contato";
import Faq from "./pages/Faq";

/**
 * @component PrivateRoute
 * @description
 * Componente auxiliar que protege páginas privadas.
 * Se o utilizador não estiver autenticado, redireciona para o login.
 * Enquanto a informação da sessão estiver a ser carregada (ex: no refresh),
 * mostra um spinner com feedback visual.
 *
 * @param {Object} props
 * @param {JSX.Element} props.children - O conteúdo protegido (ex: página)
 * @returns {JSX.Element}
 */
function PrivateRoute({ children }) {
    const { user, isLoading } = useContext(AuthContext);

    // Enquanto a app verifica se há sessão guardada (cookie JWT),
    // mostra um indicador de carregamento
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">
                        A verificar sessão...
                    </span>
                </div>
            </div>
        );
    }

    // Se houver utilizador autenticado, permite o acesso à rota
    // Caso contrário, redireciona para a página de login
    return user ? children : <Navigate to="/login" />;
}

/**
 * @component AppWrapper
 * @description
 * Componente que contém a lógica para mostrar ou esconder componentes globais
 * com base na rota atual (ex: ocultar Navbar no /homeShow).
 *
 * @returns {JSX.Element}
 */
function AppWrapper() {
    const location = useLocation();
    const [showChatbot, setShowChatbot] = useState(false);

    // Determina se os componentes globais devem ser escondidos nesta rota
    const hideGlobals = ["/homeShow", "/contato", "/faq", "/HOMESHOW", "/CONTATO", "/FAQ"].includes(location.pathname);


    return (
        <>
            {/* Navbar visível em todas as páginas, incluindo login/register */}
            {!hideGlobals && <Navbar />}

            {/* Barra de pesquisa global, visível em todas as páginas */}
            {!hideGlobals && <SearchBar />}

            {/* Leitor de música global fixo no fundo da aplicação */}
            {!hideGlobals && <MusicPlayer />}

            {/* Componente para mostrar mensagens rápidas (toasts) */}
            <ToastContainer
                position="bottom-right"
                autoClose={2500}
                hideProgressBar
                newestOnTop
            />

            {/* Definição das rotas da aplicação */}
            <Routes>
                {/* Rotas privadas: só acessíveis após login */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/library"
                    element={
                        <PrivateRoute>
                            <Library />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/playlists"
                    element={
                        <PrivateRoute>
                            <Playlists />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/playlists/:playlistId"
                    element={
                        <PrivateRoute>
                            <PlaylistDetail />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/gostadas"
                    element={
                        <PrivateRoute>
                            <LikedSongs />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/albums/:id"
                    element={
                        <PrivateRoute>
                            <AlbumDetail />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/chatbot-playlist"
                    element={
                        <PrivateRoute>
                            <ChatbotPlaylist />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/artist-profile"
                    element={
                        <ProtectedArtistRoute>
                            <ArtistProfile />
                        </ProtectedArtistRoute>
                    }
                />

                {/* Rotas públicas: login e registo */}
                <Route path="/artists" element={<Artists />} />
                <Route path="/artists/:id" element={<ArtistDetail />} />
                <Route path="/pesquisa" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/homeShow" element={<HomeShow />} />
                <Route path="/contato" element={<Contato />} />
                <Route path="/faq" element={<Faq />} />

                {/* Rota fallback: redireciona tudo o que não existir para login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>

            {/* Botão flutuante para abrir o chatbot */}
            {!hideGlobals && (
                <ChatbotToggleButton
                    onClick={() => setShowChatbot((prev) => !prev)}
                />
            )}

            {/* Popup com o chatbot */}
            {!hideGlobals && showChatbot && (
                <div className="chatbot-popup chatbot-popup-wrapper">
                    <ArtistChatbot onClose={() => setShowChatbot(false)} />
                </div>
            )}
        </>
    );
}

/**
 * @component App
 * @description
 * Componente principal da aplicação. Contém:
 * - o router com as rotas principais,
 * - os contextos de autenticação e música,
 * - a Navbar visível em todas as páginas,
 * - o leitor de música fixo no fundo,
 * - o sistema de toasts para feedback visual.
 *
 * @returns {JSX.Element}
 */
export default function App() {
    return (
        <BrowserRouter>
            <AppWrapper />
        </BrowserRouter>
    );
}
