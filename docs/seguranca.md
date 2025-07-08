# Segurança na Aplicação SoundDream

## Visão Geral

A segurança é uma prioridade central no SoundDream, tanto no backend (Node.js/Express) como no frontend (React). O sistema implementa múltiplas camadas de proteção para garantir a integridade dos dados, a privacidade dos utilizadores e a robustez contra ataques comuns em aplicações web modernas.

---

## Autenticação e Sessão

- **JWT HttpOnly:**  
  Os tokens de autenticação são armazenados em cookies HttpOnly, tornando-os inacessíveis via JavaScript e protegendo contra ataques XSS.
- **Expiração de Sessão:**  
  Os tokens têm validade configurável (ex: 2 dias) e são renovados apenas quando necessário.
- **Logout Seguro:**  
  O logout remove o cookie JWT e invalida a sessão no backend.

---

## Proteção CSRF

- **Token CSRF:**  
  Todas as operações de mutação (POST, PATCH, DELETE) exigem um token CSRF, enviado via header `X-CSRF-Token`.
- **Double Submit Cookie:**  
  O token CSRF é gerado no backend e enviado como cookie e como valor a ser enviado no header, protegendo contra ataques de Cross-Site Request Forgery.
- **Validação no Backend:**  
  O middleware `csurf` valida o token em cada pedido sensível.

---

## Rate Limiting

- **Limites por Endpoint:**  
  Limites de requisições por IP para endpoints sensíveis (login, registo, likes, reprodução) usando `express-rate-limit`.
- **Configuração Personalizável:**  
  Os limites podem ser ajustados via variáveis de ambiente.

---

## Validação e Sanitização

- **Validação de Dados:**  
  Todos os dados recebidos são validados com `Joi` (backend) e validações adicionais no frontend.
- **Sanitização:**  
  Campos de texto são limpos com `sanitize-html` para evitar XSS e injeção de código malicioso.

---

## Gestão de Permissões

- **Middleware de Autorização:**  
  Apenas utilizadores autenticados podem aceder a rotas privadas.
- **Verificação de Ownership:**  
  Ações como editar ou apagar playlists só são permitidas ao dono da playlist.
- **Papéis de Utilizador:**  
  Suporte a diferentes papéis (user, artist, admin) para controlo de permissões (futuro).

---

## Segurança de Cookies

- **SameSite Policy:**  
  Os cookies usam a política `SameSite=Lax` ou `Strict` para mitigar CSRF.
- **Secure:**  
  Em produção, os cookies são enviados apenas por HTTPS (`secure: true`).

---

## Segurança de API

- **CORS Restrito:**  
  Apenas o frontend autorizado pode comunicar com a API.
- **Helmet:**  
  Uso do middleware `helmet` para definir headers de segurança HTTP (CSP, X-Frame-Options, etc).
- **Proteção contra NoSQL Injection:**  
  Uso de Mongoose e validação rigorosa dos dados.

---

## Logging e Monitorização

- **Winston:**  
  Todos os erros e eventos críticos são registados em ficheiros de log.
- **Logs de Erro e Recomendações:**  
  Logs separados para erros e para recomendações musicais.

---

## Boas Práticas Adicionais

- **Soft-delete:**  
  Dados sensíveis (músicas, playlists, utilizadores) são marcados como eliminados em vez de serem removidos fisicamente.
- **Atualização de Dependências:**  
  Dependências mantidas atualizadas para evitar vulnerabilidades conhecidas.
- **Sem Dados Sensíveis no Frontend:**  
  O JWT nunca é exposto ao JavaScript do cliente.

---

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MDN Web Docs - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

> **Nota:**  
> Esta aplicação foi desenvolvida para fins educativos, mas segue práticas recomendadas de segurança para aplicações web