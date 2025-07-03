import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import MusicPlayer from "./components/MusicPlayer";
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

function PrivateRoute({ children }) {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">A verificar sessão...</span>
                </div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
}

// Componente auxiliar para permitir uso de useLocation() dentro do BrowserRouter
function AppContent() {
    const location = useLocation();
    const hideSearchBar = location.pathname === "/login" || location.pathname === "/register";

    return (
        <>
            <Navbar />
            {!hideSearchBar && <SearchBar />}
            <MusicPlayer />

            <ToastContainer
                position="bottom-right"
                autoClose={2500}
                hideProgressBar
                newestOnTop
            />

            <Routes>
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
                <Route path="/artists" element={<Artists />} />
                <Route path="/artists/:id" element={<ArtistDetail />} />
                <Route path="/pesquisa" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </>
    );
}

// Componente principal com tudo incluído
export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
