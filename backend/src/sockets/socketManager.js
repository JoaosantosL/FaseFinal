/**
 * @file socketManager.js
 * @description
 * Gera e gere o servidor WebSocket da aplicação.
 * Permite comunicação em tempo real entre os utilizadores (ex: reações, online).
 *
 * Exporta:
 * - initWebSocket(server): inicializa o WebSocket Server ligado ao HTTP
 * - broadcast(event, payload): envia um evento a todos os clientes conectados
 * - getOnlineUsers(): devolve os IDs dos utilizadores atualmente online
 */

const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

// Variável global que guarda a instância do WebSocket Server
let wss;

// Estrutura para manter os utilizadores online
// Cada userId fica associado ao seu socket WebSocket
const online = new Map();

/**
 * Inicializa o servidor WebSocket e liga-o ao servidor HTTP Express existente.
 *
 * Cada cliente deve enviar o token JWT como parâmetro da URL (ex: ws://.../ws?token=xxx).
 * O token é verificado no momento da ligação.
 *
 * @param {http.Server} server - Servidor HTTP criado com createServer(app)
 */
function initWebSocket(server) {
    // Cria o WebSocket Server e escuta no path /ws
    wss = new WebSocket.Server({ server, path: "/ws" });

    wss.on("connection", (ws, req) => {
        // Etapa 1: Extração e validação do token da query string
        const url = new URL(`ws://dummy${req.url}`); // usa dummy para poder extrair params
        const token = url.searchParams.get("token");

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET); // autenticação
        } catch {
            // Se o token for inválido, termina a ligação com código 4001
            return ws.close(4001, "Invalid token");
        }

        // Se JWT for válido, guarda o userId associado ao socket
        const userId = decoded.id;
        ws.userId = userId;

        // Adiciona este utilizador ao mapa de utilizadores online
        online.set(userId, ws);

        // Informa todos os outros clientes que este utilizador se ligou
        broadcast("user:connect", { userId });

        // Etapa 2: Ao desconectar, remove do mapa e notifica os outros
        ws.on("close", () => {
            online.delete(userId);
            broadcast("user:disconnect", { userId });
        });
    });
}

/**
 * Envia um evento WebSocket a todos os utilizadores online.
 *
 * @param {string} event - Nome do evento (ex: "music:react")
 * @param {any} payload - Dados a enviar (ex: { musicId, userId, type })
 */
function broadcast(event, payload) {
    const msg = JSON.stringify({ event, payload });

    // Envia apenas para sockets com ligação ativa (OPEN)
    online.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(msg);
        }
    });
}

/**
 * Devolve um array com os userIds de todos os utilizadores online.
 *
 * @returns {string[]} Lista de IDs de utilizadores ligados via WebSocket
 */
const getOnlineUsers = () => Array.from(online.keys());

// Exporta as funções para uso noutros ficheiros (ex: app.js ou rotas)
module.exports = { initWebSocket, broadcast, getOnlineUsers };
