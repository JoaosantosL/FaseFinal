/**
 * @file sanitize.js
 * @description
 * Função utilitária para limpar texto vindo do utilizador.
 *
 * Remove TODAS as tags HTML e atributos — protegendo contra
 * XSS (Cross-Site Scripting) e injecções maliciosas.
 *
 * Usa o módulo sanitize-html com política “zero trust”:
 * - Nenhum HTML permitido (allowedTags: [])
 * - Nenhum atributo permitido (allowedAttributes: {})
 *
 * Exemplo:
 *   const name = sanitize(req.body.name);
 */

const sanitizeHtml = require("sanitize-html");

/**
 * Limpa uma string de qualquer HTML potencialmente perigoso.
 *
 * Esta função é especialmente importante para campos de texto
 * livre vindos do frontend, como `bio`, `descrição`, `nome da playlist`.
 *
 * Política aplicada:
 * - Remove qualquer tag (mesmo <b>, <i>, <img>, <script>, etc.)
 * - Remove atributos como `onclick`, `style`, `src`, etc.
 * - Garante que só sobram caracteres puros (sem HTML)
 *
 * @param {string} [dirty=''] Texto original vindo do cliente
 * @returns {string} Texto limpo (apenas caracteres visíveis)
 */
function sanitize(dirty = "") {
    return sanitizeHtml(dirty, {
        allowedTags: [], // Bloqueia todas as tags HTML
        allowedAttributes: {}, // Remove todos os atributos
        allowedIframeHostnames: [], // Protege contra <iframe src=...>
    });
}

module.exports = sanitize;
