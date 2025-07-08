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
| 2025-06-22 | Nuno M. Castro | Algoritmo de Sugestão e Machine Learning                             |
| 2025-07-04 | Nuno M. Castro | Implementação de assistente IA para criação de playlists             |

---

## Repositórios

| Parte         | Link                                                           |
| ------------- | -------------------------------------------------------------- |
| **Backend**   | https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Backend  |
| **Frontend**  | https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Frontend |
| **Docs (md)** | https://github.com/NunoMACastro/EPMS_2425_3IG_Ficha12_Docs     |

---

## Documentação Complementar

| Documento                                        | Descrição                              |
| ------------------------------------------------ | -------------------------------------- |
| [INSTRUCOES.md](./INSTRUCOES.md)                 | Instruções para IA                     |
| [PLANEAMENTO.md](./PLANEAMENTO.md)               | Planeamento por fases                  |
| [TODO.md](./TODO.md)                             | Tarefas em curso                       |
| [API-ENDPOINTS.md](./API-ENDPOINTS.md)           | Endpoints RESTful                      |
| [MODELOS.md](./MODELOS.md)                       | Modelos Mongoose                       |
| [ROLES.md](./ROLES.md)                           | Papéis e permissões                    |
| [CONVENCOES.md](./CONVENCOES.md)                 | Convenções e arquitetura               |
| [ERRORS.md](./ERRORS.md)                         | Tipos e gestão de erros                |
| [WEBSOCKETS.md](./WEBSOCKETS.md)                 | Especificação de eventos em tempo real |
| [ALGORITMO-SUGESTAO.md](./ALGORITMO-SUGESTAO.md) | Algoritmo de sugestão musical e IA     |

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

| Categoria        | Funcionalidade                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| Músicas          | Listagem global, detalhes, registo de reproduções, likes, reações (emoji)  |
| Biblioteca       | Guardar músicas pessoais, ver estatísticas (última reprodução, total)      |
| Playlists        | Criar, editar, apagar playlists privadas                                   |
| Likes            | Visíveis apenas para utilizadores autenticados                             |
| Pesquisa         | Pesquisa global por artista, álbum ou nome de música                       |
| Conta            | Registo, login, logout, sessão atual (/me)                                 |
| Pesquisa Global  | Pesquisa por músicas, artistas e álbuns com query string `q`               |
| Machine Learning | Algoritmo de sugestão de músicas baseado em histórico, likes e bibliotecas |

---

## Tipos de Utilizador

| Papel  | Funcionalidades                                                                 |
| ------ | ------------------------------------------------------------------------------- |
| user   | Ouvir música, guardar em biblioteca, criar playlists, dar likes, reagir         |
| artist | Tudo o que um user faz + poderá submeter músicas para aprovação (futuro)        |
| admin  | Moderar submissões, aprovar/rejeitar conteúdos, consultar estatísticas (futuro) |

---

## Sistema de Recomendação Musical

A aplicação SoundDream inclui um sistema inteligente de sugestões personalizadas para cada utilizador autenticado.

### Como funciona

Utiliza **item-based collaborative filtering** com **cosseno de similaridade** entre músicas, com base em interações reais dos utilizadores:

-   Likes
-   Biblioteca pessoal
-   Músicas reproduzidas

Cada interação tem um peso (ex: like = 3, biblioteca = 2, reprodução = 1) e é usada para calcular o **perfil vetorial** do utilizador.  
Esse perfil é comparado com outras músicas do sistema para gerar sugestões relevantes.

---

### Detalhes técnicos

-   Algoritmo: `cosineSimilarity(setA, setB)`
-   Linguagem: JavaScript puro (sem bibliotecas externas)
-   Estrutura:
    -   `Set` de utilizadores por música
    -   `Map` para armazenar vetores
    -   `.lean()` e `.select()` para otimizar queries
-   Logging com Winston para debug e fallback

---

### Fallback inteligente

Caso o utilizador ainda não tenha interações suficientes, a aplicação recorre a um **fallback automático**, que devolve as 3 músicas com mais reproduções (`plays`).

---

### Endpoint da API

```http
GET /api/recommendations
```

-   Acesso: Privado (JWT)
-   Retorna: Array com 3 músicas recomendadas

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

## Assistente IA para criação de Playlists

A aplicação inclui um assistente inteligente que permite ao utilizador criar playlists personalizadas através de um diálogo natural. Esta funcionalidade está acessível a partir da página de playlists e segue o seguinte fluxo:

-   Interface de chatbot com perguntas variáveis em 6 categorias:
    -   Género musical
    -   Estado de espírito
    -   Velocidade (tempo)
    -   Década
    -   Contexto/ocasião
    -   Conhecimento prévio das músicas
-   Pergunta obrigatória ou toggle sobre **incluir ou não música portuguesa**
-   As perguntas são variadas para parecer uma conversa real
-   As respostas são convertidas para uma _prompt_ enviada à **API da OpenAI**, que devolve uma lista de músicas sugeridas (por título + artista)
-   As músicas sugeridas são validadas com base nas existentes na base de dados
-   O utilizador pode:
    -   Rever as sugestões
    -   Escolher um nome para a nova playlist
    -   Criar a playlist diretamente a partir das sugestões
-   Caso não sejam encontradas sugestões compatíveis suficientes, o sistema apresenta uma mensagem apropriada e convida o utilizador a tentar novamente
-   A playlist criada é imediatamente adicionada ao estado e visível na interface
-   Visual e usabilidade coerentes com o resto da aplicação (botões, toasts, layout responsivo)

---

---

## Chatbot sobre Artistas

A aplicação permite que qualquer utilizador faça perguntas sobre um artista específico, recorrendo a um modelo da OpenAI treinado com base nos dados fornecidos pelo próprio artista.

### Fluxo funcional

1. O utilizador é convidado a indicar o nome do artista.
2. O backend faz fuzzy match ao nome e valida se o artista está público.
3. Se o artista for encontrado:
    - São carregados os seguintes campos do MongoDB:
        - `bio`, `percurso`, `influences`, `facts`, `extraInfo`
        - Álbuns e respetivas músicas, com `plays` e `likes`
4. É construída uma prompt rica que resume toda a informação.
5. Essa prompt é enviada para a **OpenAI API** (modelo `gpt-4o` com `temperature: 0.7`).
6. A resposta gerada é devolvida ao frontend e apresentada em formato de diálogo.
7. O utilizador pode continuar a conversa com perguntas adicionais sobre o mesmo artista.

### Exemplo de perguntas

-   Qual foi a maior colaboração de [artista]?
-   Quais os estilos que mais influenciam a música?
-   Que músicas são mais conhecidas?
-   Quando foi lançado o primeiro álbum?

### Estrutura do componente

-   Componente: `ArtistChatbot.jsx`
-   Layout: bolhas de conversa (tipo chatbot), histórico de perguntas/respostas
-   Estados:
    -   Artista selecionado
    -   Pergunta atual
    -   Histórico da conversa
-   Toasts em caso de erro ou artista não encontrado

### Endpoint da API

```http
POST /api/chatbot/artist-info
```

Requisição

```json
{
    "artistName": "Ana Bacalhau",
    "question": "Quais são os factos mais curiosos sobre ela?"
}
```

Requisitos
• Apenas artistas públicos são pesquisáveis
• O campo extraInfo (invisível no frontend) permite enriquecer as respostas com histórias ou bastidores
• O endpoint está protegido por validação e logging estruturado com Winston

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
