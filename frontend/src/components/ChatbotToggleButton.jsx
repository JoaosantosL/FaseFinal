/**
 * @file ChatbotToggleButton.jsx
 * @description
 * Botão fixo no canto inferior direito que abre ou fecha o chatbot de artista.
 */

import React from "react";
import { FaRobot } from "react-icons/fa"; // Ícone semelhante aos existentes

export default function ChatbotToggleButton({ onClick }) {
    return (
        <button className="chatbot-toggle-button" onClick={onClick} title="Falar com o chatbot">
            <FaRobot size={20} />
        </button>
    );
}