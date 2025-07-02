/**
 * @file logger.js
 * @description
 * Configuração personalizada do Winston para logging no projeto SoundDream.
 *
 * - Mostra logs no terminal (colorido) com nível "info" ou superior.
 * - Guarda todos os erros (nível "error") num ficheiro `logs/error.log`.
 * - Ideal para debugging durante desenvolvimento e auditoria posterior.
 *
 * NOTA: Não tem rotação de ficheiros. O ficheiro pode crescer, mas isso é aceitável num projeto escolar.
 *
 * @module utils/logger
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

/**
 * Formato personalizado de log:
 * - Adiciona timestamp (ex: 2025-06-04 18:45:02)
 * - Mostra o nível do log (info, error, warn...)
 * - Mostra a mensagem principal
 * - Se houver metadata (objeto extra), também é mostrado (ex: stack, route)
 */
const logFormat = combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}] ${message}${
            Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
        }`;
    })
);

/**
 * Instância principal do logger Winston.
 * Define:
 * - Nível mínimo de logs: "info"
 * - Console com cores para desenvolvimento
 * - Ficheiro "logs/error.log" para guardar erros
 */
const logger = createLogger({
    level: "info", // níveis: error < warn < info < http < verbose < debug < silly
    format: logFormat,
    transports: [
        // Mostra os logs no terminal (com cores)
        new transports.Console({
            format: combine(colorize(), logFormat),
        }),

        // Guarda todos os erros num ficheiro
        new transports.File({
            filename: "logs/error.log",
            level: "error", // apenas "error" e acima
        }),

        // Guarda logs de recomendações num ficheiro
        new transports.File({
            filename: "logs/recommendations.log",
            level: "info", // aceita tudo desde info para cima
        }),
    ],
});

module.exports = logger;
