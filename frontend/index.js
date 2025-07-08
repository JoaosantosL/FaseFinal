/**
 * @file index.js
 * @description Ponto de entrada principal da aplicação SoundDream.
 * Inicializa variáveis de ambiente, valida sua presença, conecta à base de dados MongoDB
 * e arranca o servidor Express com suporte a WebSockets.
 */

const http = require("http"); // Módulo interno do Node para criar servidor HTTP
require("dotenv").config(); // Carrega as variáveis definidas no ficheiro .env

// ─────────────────────────────────────────────────────
// Módulos da aplicação (já configurados)
// ─────────────────────────────────────────────────────

const app = require("./src/app"); // A aplicação Express (rotas, middlewares, segurança, etc.)
const connectDB = require("./src/config/db"); // Função para ligar à base de dados
const logger = require("./src/utils/logger"); // Logger Winston personalizado
const { initWebSocket } = require("./src/sockets/socketManager"); // Inicializa WebSocket

// ─────────────────────────────────────────────────────
//  Verificação das variáveis de ambiente obrigatórias (.env)
// ─────────────────────────────────────────────────────

const requiredEnvs = [
    "PORT",
    "DB_URI",
    "JWT_SECRET",
    "JWT_EXPIRES",
    "FRONTEND_ORIGIN",
    "LOG_LEVEL",
    "NODE_ENV",
    "SAMESITE_POLICY",
    "RATE_LIMIT_LOGIN",
    "RATE_LIMIT_REGISTER",
    "RATE_LIMIT_PLAY",
    "RATE_LIMIT_REACT",
    "SYNC_INDEXES",
];

// Impede o arranque da app se faltar alguma variável essencial
requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        logger.error(`ERRO: Variável de ambiente ${key} não definida.`);
        process.exit(1); // Termina imediatamente o processo
    }
});

logger.info("Variáveis de ambiente carregadas com sucesso.");

// ─────────────────────────────────────────────────────
// 2️⃣ Criação do servidor HTTP e ativação do WebSocket
// ─────────────────────────────────────────────────────

const server = http.createServer(app); // Cria o servidor base usando Express
initWebSocket(server); // Ativa o servidor de WebSocket

// ─────────────────────────────────────────────────────
// 3️⃣ Conexão à base de dados e arranque do servidor
// ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    server.listen(PORT, () => {
        logger.info(`Servidor a correr em http://localhost:${PORT}`);
    });
});
