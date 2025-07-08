/**
 * @file MusicListItemInfoOnly.jsx
 * @description
 * Componente simplificado que apresenta apenas os dados informativos da música:
 * - Thumbnail (capa)
 * - Título e artista
 * - Subtítulo com álbum (se existir)
 * - Duração, audições e likes
 * Estilizado de forma semelhante a "Músicas ouvidas recentemente"
 */

import React from "react";

/**
 * Formata a duração de segundos para "min:seg"
 * @param {number} duration
 * @returns {string}
 */
function formatDuration(duration) {
    if (!duration || isNaN(duration)) return "--:--";
    const min = Math.floor(duration / 60);
    const sec = duration % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

/**
 * @component MusicListItemInfoOnly
 * @param {Object} props
 * @param {Object} props.music - Objeto da música com os campos mínimos
 * @returns JSX.Element
 */
export default function MusicListItemInfoOnly({ music }) {
    return (
        <li className="music-list-item">
            {/* Thumbnail da música */}
            <img
                className="cover"
                src={`${process.env.REACT_APP_BACKEND_URL}${music.coverUrl}`}
                alt={`Capa de ${music.title}`}
            />

            {/* Info textual */}
            <div className="info">
                <div className="title">{music.title}</div>
                <div className="sub">
                    {music.albumTitle ? ` — ${music.albumTitle}` : ""}
                </div>
            </div>

            {/* Estatísticas */}
            <div className="muted small text-end">
                Duração: {formatDuration(music.duration)} · Audições: {music.plays ?? 0} · Likes: {music.likesCount ?? 0}
            </div>
        </li>
    );
}