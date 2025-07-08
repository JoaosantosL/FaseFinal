/**
 * @file openai.js
 * @description
 * Instância da API OpenAI configurada com a chave do ficheiro .env
 * Usada para gerar playlists personalizadas no chatbot.
 */

const OpenAI = require("openai");

// Garante que a variável de ambiente existe
if (!process.env.OPENAI_API_KEY) {
    throw new Error("A variável OPENAI_API_KEY não está definida no .env");
}

// Instância configurada da OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
