/**
 * @file axios.js
 * @description
 * Configuração centralizada da instância Axios usada pela aplicação.
 *
 * - Define a baseURL com `REACT_APP_API_URL` do .env
 * - Ativa `withCredentials` para enviar cookies (JWT HttpOnly)
 * - Adiciona um interceptor de resposta para tratamento uniforme de erros
 */

import axios from "axios";

/**
 * @constant api
 * @description
 * Instância Axios personalizada com:
 * - `baseURL`: endereço base da API (ex: http://localhost:3001/api)
 * - `withCredentials`: garante envio automático de cookies (ex: JWT em HttpOnly cookie)
 */
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

/**
 * Interceptor de resposta Axios
 * - Capta todas as respostas da API (sucesso ou erro)
 * - Em caso de erro, tenta mostrar uma mensagem clara no console
 * - Este mecanismo pode ser trocado por toasts ou alertas globais
 */
api.interceptors.response.use(
    (response) => {
        // Se a resposta for bem-sucedida, retorna tal como está
        return response;
    },
    (error) => {
        // Se houver erro na resposta, tenta extrair mensagem útil
        const msg = error?.response?.data?.error || "Erro inesperado.";

        // Mostra a mensagem no console (pode ser trocado por toast)
        console.error("Erro da API:", msg);

        // Rejeita para que o componente que fez o pedido possa tratar o erro
        return Promise.reject(error);
    }
);

export default api;
