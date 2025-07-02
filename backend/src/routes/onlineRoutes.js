/**
 * @file onlineRoutes.js
 * @description
 * Define uma rota REST para consultar os utilizadores atualmente online.
 * A informação vem do servidor WebSocket (socketManager), onde os utilizadores
 * são registados aquando da ligação (user:connect) e remoção (user:disconnect).
 */

const express = require("express");
const router = express.Router();

// ─────────────────────────────────────────────────────
// Importa a função utilitária que mantém a lista de online
// Esta função vive no contexto do WebSocket
// ─────────────────────────────────────────────────────

const { getOnlineUsers } = require("../sockets/socketManager");

// ─────────────────────────────────────────────────────
// GET /api/users/online
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/users/online
 * @description Devolve um array com os IDs dos utilizadores online
 * (geridos pelo WebSocket, não pela base de dados)
 * @returns {Object} JSON no formato: { success: true, data: [ "userId1", "userId2", ... ] }
 * @access Público
 *
 * Esta rota REST é útil para o frontend consultar os online no arranque da aplicação.
 * As atualizações em tempo real são feitas via WebSocket (eventos).
 */
router.get("/online", (req, res) => {
    // Chama função que devolve o Set (ou array) de utilizadores ligados
    const online = getOnlineUsers();

    // Responde com sucesso e array de userIds (strings)
    res.json({ success: true, data: online });
});

// Exporta o router para ser usado em app.js
module.exports = router;
