/**
 * @file AlbumCard.jsx
 * @description
 * Cartão visual de um álbum, com capa e nome.
 * Estilo inspirado no MusicCard (sem botões).
 */

import React from "react";
import { Link } from "react-router-dom";

/**
 * @component AlbumCard
 * @param {Object} props
 * @param {string} props._id - ID do álbum
 * @param {string} props.title - Título do álbum
 * @param {string} props.coverUrl - URL da capa
 * @param {string} props.artistName - Nome do artista
 * @returns {JSX.Element}
 */
export default function AlbumCard({ _id, title, coverUrl, artistName }) {
    return (
        <Link to={`/albums/${_id}`} className="text-decoration-none">
            <div className="music-card mb-3 hover-scale">
                {/* Imagem da capa (usa estilos de MusicCard) */}
                <div className="cover-container">
                    <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${coverUrl}`}
                        alt={`Capa de ${title}`}
                        className="cover-image"
                    />
                </div>

                {/* Info do álbum */}
                <div className="text-center mt-2">
                    <div className="fw-semibold" style={{ color: "var(--text)" }}>
                        {title}
                    </div>
                    <div className="muted small mb-2">{artistName}</div>
                </div>
            </div>
        </Link>
    );
}