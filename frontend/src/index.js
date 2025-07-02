/**
 * @file index.js
 * @description
 * Ponto de entrada da aplicação React SoundDream.
 * Envolve a aplicação com os contextos globais de autenticação (AuthContext)
 * e música (MusicContext). Também aplica os estilos globais e Bootstrap.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Contexto de autenticação global
import { AuthProvider } from "./context/AuthContext";

// Contexto global de música (gestão de música atual, estado do leitor, etc.)
import { MusicProvider } from "./context/MusicContext";

// Estilos globais e Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/theme.css";

// Obtém a referência ao elemento root no HTML
const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderiza a aplicação React, dentro dos providers globais
root.render(
    <React.StrictMode>
        <AuthProvider>
            <MusicProvider>
                <App />
            </MusicProvider>
        </AuthProvider>
    </React.StrictMode>
);
