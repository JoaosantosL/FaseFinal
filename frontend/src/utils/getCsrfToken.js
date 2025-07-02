/**
 * @file getCsrfToken.js
 * @description
 * Função utilitária que obtém o token CSRF a partir do backend.
 *
 * Usado para proteger pedidos `POST`, `PATCH`, `DELETE` contra ataques CSRF.
 * Deve ser invocado antes de qualquer pedido protegido, e o token incluído no header:
 *
 * Exemplo de uso:
 * ```js
 * const token = await getCsrfToken();
 * await api.post("/rota", dados, {
 *   headers: { "X-CSRF-Token": token }
 * });
 * ```
 */

import api from "../services/axios";

/**
 * @function getCsrfToken
 * @description
 * Faz um `GET /csrf-token` e devolve apenas o token CSRF.
 *
 * @returns {Promise<string>} O token CSRF a incluir no cabeçalho `X-CSRF-Token`
 */
export default async function getCsrfToken() {
    const { data } = await api.get("/csrf-token");
    return data.csrfToken;
}
