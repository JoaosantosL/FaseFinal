/**
 * @file app.js
 * @description Configuração da aplicação Express:
 * - Define middlewares globais de segurança, parsing, cookies e CSRF
 * - Configura CORS com whitelist
 * - Aplica política de Content Security Policy (CSP) via Helmet
 * - Regista as rotas da API
 * - Aplica middleware global de erro
 */

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const logger = require("./utils/logger");

const authRoutes = require("./routes/authRoutes");
const musicRoutes = require("./routes/musicRoutes");
const userRoutes = require("./routes/userRoutes");
const artistRoutes = require("./routes/artistRoutes");
const onlineRoutes = require("./routes/onlineRoutes");
const searchRoutes = require("./routes/searchRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

// ─────────────────────────────────────────────────────
// Servir ficheiros estáticos (ex: imagens de capas ou áudio)
// ─────────────────────────────────────────────────────

app.use(
    "/public",
    express.static(path.join(__dirname, "../public"), {
        setHeaders: (res, _path) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        },
    })
);

// ─────────────────────────────────────────────────────
// Segurança: Helmet + Content Security Policy (CSP)
// ─────────────────────────────────────────────────────

const { FRONTEND_ORIGIN, NODE_ENV } = process.env;

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"], // Só permite a origem da API
                scriptSrc: ["'self'", FRONTEND_ORIGIN],
                styleSrc: ["'self'", "'unsafe-inline'", FRONTEND_ORIGIN],
                imgSrc: ["'self'", "data:", FRONTEND_ORIGIN],
                connectSrc: ["'self'", FRONTEND_ORIGIN, "ws:"], // para WebSockets
                fontSrc: ["'self'", FRONTEND_ORIGIN],
                objectSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
    })
);

// Apenas em dev: loga a origem permitida
if (NODE_ENV !== "production") {
    logger.info(`[CSP] Ativada com origem: ${FRONTEND_ORIGIN}`);
}

// ─────────────────────────────────────────────────────
// Middlewares base: JSON + cookies
// ─────────────────────────────────────────────────────

app.use(express.json()); // Permite leitura de JSON no corpo da requisição
app.use(cookieParser()); // Permite ler cookies enviados pelo browser

// ─────────────────────────────────────────────────────
// CORS (Cross-Origin Resource Sharing)
// ─────────────────────────────────────────────────────

const allowedOrigins = [FRONTEND_ORIGIN];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // permite enviar cookies com as requisições
    })
);

// ─────────────────────────────────────────────────────
// CSRF (Cross-Site Request Forgery)
// ─────────────────────────────────────────────────────

app.use(
    csurf({
        cookie: true, // guarda o token CSRF num cookie HttpOnly
    })
);

// Endpoint dedicado para fornecer o token CSRF ao frontend
app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// ─────────────────────────────────────────────────────
// Rota de teste rápida
// ─────────────────────────────────────────────────────

app.get("/", (req, res) => {
    res.json({ success: true, message: "API - Ficha 12" });
});

// ─────────────────────────────────────────────────────
// Registo das rotas principais
// ─────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/users", userRoutes);
app.use("/api", artistRoutes);
app.use("/api/users", onlineRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendation", recommendationRoutes);

// ─────────────────────────────────────────────────────
// Middleware Global de Erros
// ─────────────────────────────────────────────────────

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Exporta a app para ser usada em index.js (ponto de entrada do servidor)
module.exports = app;
