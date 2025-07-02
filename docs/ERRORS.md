# ERRORS.md
// Atualizado por João em 30/05/2025
## Gestão e Estrutura de Mensagens de Erro
*Última atualização: 30/05/2025*
Este documento descreve como os erros são tratados e estruturados no projeto SoundDream, tanto no backend como no frontend.

---

## Tratamento Global de Erros no Backend

- Todos os controladores usam funções assíncronas (ex: `catchAsync`) para encaminhar erros para o middleware global.
- Middleware global de erro definido em `middlewares/error-handler.js`.
- O `error-handler` utiliza o `logger.js` para registar erros, incluindo contexto útil (método, URL, utilizador).
- Os logs vão para a consola; em produção, para ficheiros (`logs/error.log`).
- O frontend pode assumir que todas as respostas de erro seguem o mesmo padrão.

---

## Formato Base de Resposta de Erro

```json
{
    "success": false,
    "error": "Descrição da falha",
    "code": 400
}
```

> Este formato é usado de forma uniforme em todas as respostas de erro.

---

## Helpers e Logging

- Helpers como `getUserOrFail`, `getPlaylistOrFail`, `getMusicOrFail` encapsulam verificações e mostram erros claros.
- O middleware de erro anexa ao log:
    - `req.method`
    - `req.originalUrl`
    - `req.user?.id` (se autenticado)
- Os erros são registados para facilitar o debug e a auditoria.

---

## Tipos de Erro por Contexto

### Autenticação

- Token ausente ou inválido
- Sessão expirada
- Cookie HttpOnly ausente

### Validação

- Campos obrigatórios ausentes
- IDs com formato inválido
- Dados mal formatados (`email`, `enum`, etc.)

### Acesso

- Não autenticado
- Sem permissões (ex: não é admin/artista)
- Tentativa de acesso a recursos de outro utilizador

---

## Interceptor Global para Axios (Frontend)

```js
// Exemplo para src/services/api.js ou configuração global do Axios
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg = error?.response?.data?.error || "Erro inesperado.";
        // Exemplo: mostrar toast ou alerta
        alert(msg);
        return Promise.reject(error);
    }
);
```

---

## Mensagens Padronizadas Sugeridas

| Código | Situação               | Mensagem padrão                         |
| ------ | ---------------------- | --------------------------------------- |
| 400    | Dados inválidos        | Dados inválidos                         |
| 401    | Não autenticado        | A sua sessão expirou                    |
| 403    | Proibido               | Não tem permissões suficientes          |
| 404    | Recurso não encontrado | O recurso solicitado não foi encontrado |
| 409    | Conflito               | Já existe um registo com esses dados    |
| 422    | Erro de validação      | A validação dos dados falhou            |
| 429    | Demasiados pedidos     | Aguarde antes de tentar novamente       |
| 500    | Erro interno           | Erro interno. Tente mais tarde.         |

---

## Boas Práticas

- Usar sempre o `error-handler` no final do `app.js`.
- Separar erros esperados (validação, permissões) dos técnicos.
- Nunca devolver a stack trace em produção.
- Validar sempre `params.id` e outros dados críticos.
- Usar helpers para lançar erros 404/409 com mensagens claras.
- Integrar o logger em todos os blocos `catch`.
- No frontend, tratar todos os erros com interceptores Axios.
- Validar variáveis de ambiente críticas (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `JWT_SECRET`, etc.) após carregar o `.env`.

---

## Integração com Logger

- O logger (`utils/logger.js`) está configurado com níveis: `info`, `warn`, `error`.
- Saída para consola em desenvolvimento e para ficheiros em produção.
- Em produção, os erros são guardados em `logs/error.log`.
- Pronto para integração futura com serviços externos (ex: Loggly, Datadog).
- As respostas de erro mantêm os headers de segurança aplicados globalmente (ex: CSP, X-Frame-Options).

---

