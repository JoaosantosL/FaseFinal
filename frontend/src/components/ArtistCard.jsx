/**
 * @file ArtistCard.jsx
 * @description
 * Componente visual simples que mostra a imagem e nome de um artista.
 * Estilo sem botões, badges ou sombras excessivas.
 */

import React from "react";
import { Link } from "react-router-dom";

/**
 * @component ArtistCard
 * @param {Object} props
 * @param {string} props._id - ID do artista (usado na rota)
 * @param {string} props.name - Nome do artista
 * @param {string} props.imageUrl - URL da imagem
 * @returns {JSX.Element}
 */
export default function ArtistCard({ _id, name, imageUrl }) {
    return (
        <Link to={`/artists/${_id}`} className="text-decoration-none">
            <div
                className="rounded overflow-hidden"
                style={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "1rem",
                    overflow: "hidden",
                }}
            >
                <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${imageUrl}`}
                    alt={`Imagem de ${name}`}
                    className="w-100"
                    style={{
                        height: "250px",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
                <div
                    className="py-2 text-center fw-semibold"
                    style={{
                        color: "var(--text)",
                        backgroundColor: "var(--bg-card)",
                        fontSize: "1rem",
                    }}
                >
                    {name}
                </div>
            </div>
        </Link>
    );
}