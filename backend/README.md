# SoundDream

Aplicação web fullstack para streaming e gestão de música, inspirada em plataformas como Spotify e Apple Music.  
Permite ouvir música, guardar músicas numa biblioteca pessoal, criar playlists e interagir em tempo real com outros utilizadores.

---

## Changelog

| Data       | Autor          | Alteração resumida                                                   |
| ---------- | -------------- | -------------------------------------------------------------------- |
| 2025-05-12 | Nuno M. Castro | Criação inicial do README com estrutura base do projeto              |
| 2025-05-13 | Nuno M. Castro | Inclusão de secção relativa a WebSockets                             |
| 2025-05-19 | Nuno M. Castro | Adição de validação por `location`, soft-delete, Winston, rate-limit |
| 2025-06-21 | Nuno M. Castro | Conclusão do backend: likes, biblioteca, playlists, pesquisa global  |

---

## Repositórios

| Parte         | Link                                                           |
| ------------- | -------------------------------------------------------------- |
| **Backend**   | https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Backend  |
| **Frontend**  | https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Frontend |
| **Docs (md)** | https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Docs     |

---

## Documentação Complementar

| Documento                              | Descrição                              |
| -------------------------------------- | -------------------------------------- |
| [INSTRUCOES.md](./INSTRUCOES.md)       | Instruções para IA                     |
| [PLANEAMENTO.md](./PLANEAMENTO.md)     | Planeamento por fases                  |
| [TODO.md](./TODO.md)                   | Tarefas em curso                       |
| [API-ENDPOINTS.md](./API-ENDPOINTS.md) | Endpoints RESTful                      |
| [MODELOS.md](./MODELOS.md)             | Modelos Mongoose                       |
| [ROLES.md](./ROLES.md)                 | Papéis e permissões                    |
| [CONVENCOES.md](./CONVENCOES.md)       | Convenções e arquitetura               |
| [ERRORS.md](./ERRORS.md)               | Tipos e gestão de erros                |
| [WEBSOCKETS.md](./WEBSOCKETS.md)       | Especificação de eventos em tempo real |

---

## Objetivos da Aplicação

Ensinar alunos do 12.º ano a construir uma aplicação fullstack moderna, segura e com interações em tempo real.

Os utilizadores podem:

-   Explorar músicas de um repositório global
-   Guardar músicas na biblioteca pessoal
-   Criar e editar playlists
-   Reagir às músicas com emojis
-   Ver quem está online e ouvir música com um leitor global

---

## Stack Tecnológico

-   Frontend: React 18, React Router, Axios, Bootstrap 5
-   Backend: Node 18, Express, Mongoose, `ws`, Joi, Winston, sanitize-html
-   Base de Dados: MongoDB Atlas
-   Segurança: Helmet, express-rate-limit, JWT com cookies HttpOnly + CSRF

---

## Autenticação e Autorização

-   JWT via cookie HttpOnly (secure, sameSite dinâmico)
-   Middleware: verifyToken, authorizeRole, checkOwnership
-   CSRF token incluído com estratégia double-submit cookie
-   Helmet com política CSP adaptada ao ambiente

---

## WebSocket API

A aplicação mantém ligação WebSocket para:

| Evento          | Descrição                               |
| --------------- | --------------------------------------- |
| user:connect    | Entrou online                           |
| user:disconnect | Saiu da aplicação                       |
| music:react     | Reação em tempo real (fire, love, etc.) |
| music:play      | Início de reprodução de música (futuro) |

O JWT é validado na ligação. O utilizador autenticado é injetado em ws.user.

---

## Funcionalidades Back-end Detalhadas

| Categoria       | Funcionalidade                                                            |
| --------------- | ------------------------------------------------------------------------- |
| Músicas         | Listagem global, detalhes, registo de reproduções, likes, reações (emoji) |
| Biblioteca      | Guardar músicas pessoais, ver estatísticas (última reprodução, total)     |
| Playlists       | Criar, editar, apagar playlists privadas                                  |
| Likes           | Visíveis apenas para utilizadores autenticados                            |
| Pesquisa        | Pesquisa global por artista, álbum ou nome de música                      |
| Conta           | Registo, login, logout, sessão atual (/me)                                |
| Pesquisa Global | Pesquisa por músicas, artistas e álbuns com query string `q`              |

---

## Tipos de Utilizador

| Papel  | Funcionalidades                                                                 |
| ------ | ------------------------------------------------------------------------------- |
| user   | Ouvir música, guardar em biblioteca, criar playlists, dar likes, reagir         |
| artist | Tudo o que um user faz + poderá submeter músicas para aprovação (futuro)        |
| admin  | Moderar submissões, aprovar/rejeitar conteúdos, consultar estatísticas (futuro) |

---

## Requisitos para Desenvolvimento

-   Node.js 18+
-   Conta MongoDB Atlas
-   .env configurado (a partir de .env.example)

### Variáveis de Ambiente (.env)

| Variável        | Descrição                                              |
| --------------- | ------------------------------------------------------ |
| PORT            | Porta do servidor Express                              |
| FRONTEND_ORIGIN | URL do frontend autorizado                             |
| DB_URI          | Ligação à base de dados MongoDB Atlas                  |
| JWT_SECRET      | Segredo para assinar JWT                               |
| JWT_EXPIRES     | Duração dos tokens                                     |
| NODE_ENV        | development ou production                              |
| SAMESITE_POLICY | Política lax, strict ou none                           |
| SYNC_INDEXES    | Força sincronização de índices nos modelos             |
| RATE*LIMIT*\*   | Limites por tipo de ação (login, registo, play, react) |

---

## Estrutura de Ficheiros

### Backend

```
/backend
├── index.js
└── /src
    ├── app.js
    ├── /config
    ├── /controllers
    ├── /models
    ├── /routes
    ├── /middleware
    ├── /validators
    ├── /sockets
    └── /utils
```

### Frontend

```
/frontend/src
├── components/
├── pages/
├── services/
├── context/
├── styles/
```

---

## Execução Local

```bash
git clone https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Backend
cd EPMS_2425_3IG_Ficha12_Backend
npm install
cp .env.example .env
npm run dev
```

---

## Roadmap Futuro

-   Submissão de músicas por artistas
-   Painel de moderação/admin
-   Histórico de reprodução e estatísticas
-   Recomendações musicais (algoritmo)
-   Interface dark mode
-   Integração com Docker + GitHub Actions

---

## Stakeholders

-   Cliente: Nuno M. Castro (docente)
-   Equipa: Alunos do 12.º ano de Informática de Gestão
-   Período: Maio - Junho 2025
