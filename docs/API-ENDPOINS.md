# API-ENDPOINTS.md

Lista dos principais endpoints RESTful do projeto SoundDream (FaseFinal).

---

## Autenticação

- **POST /api/auth/register**  
  Regista um novo utilizador.  
  Público | Validação: `registerSchema` | Limite: 10/hora por IP

- **POST /api/auth/login**  
  Inicia sessão (JWT em cookie HttpOnly).  
  Público | Validação: `loginSchema` | Limite: 5/hora por IP

- **POST /api/auth/logout**  
  Termina a sessão, limpando o cookie.  
  Público

- **GET /api/auth/me**  
  Devolve os dados do utilizador autenticado.  
  Requer JWT

- **GET /api/csrf-token**  
  Devolve token CSRF para o frontend.  
  Público

---

## Utilizadores

- **GET /api/users/online**  
  Lista de utilizadores online (WebSocket).  
  Público

- **GET /api/users/:id/library**  
  Biblioteca pessoal do utilizador (músicas guardadas).  
  Requer JWT

- **POST /api/users/:id/library**  
  Adiciona música à biblioteca.  
  Requer JWT

- **DELETE /api/users/:id/library/:musicId**  
  Remove música da biblioteca.  
  Requer JWT

---

## Músicas

- **GET /api/music**  
  Lista todas as músicas disponíveis.  
  Público

- **GET /api/music/:id**  
  Detalhes de uma música.  
  Público

- **POST /api/music/:id/play**  
  Regista uma reprodução da música.  
  Requer JWT | Limite: 50/hora por IP

- **POST /api/music/:id/react**  
  Reage a uma música ("fire" ou "love").  
  Requer JWT | Limite: 20/hora por IP

- **POST /api/music**  
  Adiciona uma nova música (upload).  
  Requer JWT (admin ou utilizador autorizado)

- **DELETE /api/music/:id**  
  Remove (soft-delete) uma música.  
  Requer JWT (admin)

---

## Playlists

- **GET /api/users/:id/playlists**  
  Lista as playlists do utilizador.  
  Requer JWT

- **POST /api/users/:id/playlists**  
  Cria uma nova playlist.  
  Requer JWT

- **PATCH /api/users/:id/playlists/:playlistId**  
  Edita uma playlist.  
  Requer JWT

- **DELETE /api/users/:id/playlists/:playlistId**  
  Apaga (soft-delete) uma playlist.  
  Requer JWT

---

## Subscrições

- **GET /api/subscriptions**  
  Lista os planos de subscrição disponíveis.  
  Público

- **POST /api/subscriptions**  
  Subscreve um plano.  
  Requer JWT

---

## Pesquisa

- **GET /api/search?q=palavra**  
  Pesquisa músicas, artistas ou álbuns.  
  Público

---

## Observações Técnicas

- Todas as rotas protegidas requerem cookie JWT HttpOnly.
- Validação de dados com Joi em todos os endpoints críticos.
- Inputs de texto são sanitizados para evitar XSS.
- WebSocket usado para eventos de utilizador online e reações em tempo real.
- Soft-delete implementado em músicas, álbuns e playlists.
- Respostas padronizadas: `{ success, data | error, code }`.
- Limites de rate limiting definidos por IP e endpoint, configuráveis via `.env`.

---

