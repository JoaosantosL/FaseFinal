# SoundDream — Documentação Técnica Completa
*Última atualização: 05/07/2025*

---

## Introdução

O **SoundDream** é uma aplicação web de streaming de música, desenvolvida para proporcionar uma experiência moderna e responsiva. Permite ouvir músicas, criar playlists, gerir favoritos, subscrever planos, pesquisar conteúdos e muito mais. O projeto é composto por um backend robusto em Node.js/Express/MongoDB e um frontend em React.

---

## Visão Geral do Projeto

- **Frontend:** React, Context API, Axios, React Router, CSS customizado, responsivo e mobile-first.
- **Backend:** Node.js, Express, MongoDB, JWT, CSRF, Rate Limiting, Upload de ficheiros, Logging.
- **Funcionalidades:** Autenticação segura, gestão de biblioteca, playlists, favoritos, pesquisa, subscrições, uploads, histórico, proteção de rotas e API RESTful.

---

## Estrutura do Projeto

```
FaseFinal/
│
├── Backend/                        # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/            # Lógica das rotas (ex: userController.js, musicController.js)
│   │   ├── models/                 # Modelos de dados (ex: user.js, playlist.js, music.js)
│   │   ├── routes/                 # Definição das rotas da API (ex: userRoutes.js, musicRoutes.js)
│   │   ├── middlewares/            # Middlewares globais (ex: auth.js, errorHandler.js)
│   │   ├── utils/                  # Funções utilitárias (ex: logger.js, validators.js)
│   │   └── config/                 # Configuração da base de dados e outros (ex: db.js)
│   ├── public/                     # Ficheiros públicos (uploads, assets)
│   ├── logs/                       # Ficheiros de logs da aplicação
│   ├── .env                        # Variáveis de ambiente do backend
│   ├── package.json                # Dependências e scripts do backend
│   ├── app.js                      # Configuração principal do Express
│   └── index.js                    # Ponto de entrada do servidor
│
├── FrontEnd/                       # Frontend (React)
│   ├── public/                     # Ficheiros estáticos (index.html, favicon, etc)
│   ├── src/
│   │   ├── components/             # Componentes reutilizáveis (ex: Navbar, Player)
│   │   ├── pages/                  # Páginas principais da aplicação (ex: Home, Login, Profile)
│   │   ├── services/               # Serviços para chamadas à API (ex: api.js, authService.js)
│   │   ├── hooks/                  # Custom React hooks (ex: useAuth.js)
│   │   ├── context/                # Contextos globais (ex: AuthContext.js)
│   │   ├── App.js                  # Componente principal da aplicação
│   │   └── index.js                # Ponto de entrada do React
│   ├── .env                        # Variáveis de ambiente do frontend
│   └── package.json                # Dependências e scripts do frontend
│
├── docs/                           # Documentação do projeto
│   └── README.md                   # Este ficheiro
│
└── README.md                       # Documentação principal do projeto
```

---

## Como Executar

1. **Pré-requisitos:**
   - Node.js (v18+)
   - MongoDB Atlas (ou local)
   - npm

2. **Instalação:**

   ```bash
   cd Backend
   npm install
   cd ../FrontEnd
   npm install
   ```

3. **Configuração das variáveis de ambiente:**

   Cria um ficheiro `.env` na pasta `Backend/` com o seguinte conteúdo:

   ```
   PORT=3001
   FRONTEND_ORIGIN=http://localhost:3000
   DB_URI=mongodb+srv://<user>:<password>@<host>/<dbname>
   JWT_SECRET=umsegredoseguro
   JWT_EXPIRES=2d
   LOG_LEVEL=info
   NODE_ENV=development
   SAMESITE_POLICY=lax
   RATE_LIMIT_LOGIN=5
   RATE_LIMIT_REGISTER=10
   RATE_LIMIT_PLAY=50
   RATE_LIMIT_REACT=20
   SYNC_INDEXES=true
   ```

   E um ficheiro `.env` na pasta `FrontEnd/`:

   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Executar o backend:**

   ```bash
   cd Backend
   npm start
   ```

5. **Executar o frontend:**

   ```bash
   cd FrontEnd
   npm start
   ```

---

## Variáveis de Ambiente

### Backend

| Variável           | Descrição                                 |
|--------------------|-------------------------------------------|
| PORT               | Porta do servidor Express                 |
| FRONTEND_ORIGIN    | Origem permitida para CORS                |
| DB_URI             | String de ligação ao MongoDB              |
| JWT_SECRET         | Segredo para JWT                          |
| JWT_EXPIRES        | Validade do token JWT (ex: 2d, 12h, 1w)   |
| LOG_LEVEL          | Nível de logging                          |
| NODE_ENV           | Ambiente de execução                      |
| SAMESITE_POLICY    | Política SameSite dos cookies             |
| RATE_LIMIT_*       | Limites de rate limiting por funcionalidade|
| SYNC_INDEXES       | Sincronizar índices do MongoDB            |

### Frontend

| Variável              | Descrição                        |
|-----------------------|----------------------------------|
| REACT_APP_API_URL     | URL da API do backend            |

---

## Principais Funcionalidades

- Autenticação de utilizadores (registo, login, JWT)
- Gestão de músicas, álbuns, artistas e playlists
- Pesquisa de faixas e artistas
- Favoritos e histórico de reprodução
- Subscrição de planos
- Upload de ficheiros
- Logging e rate limiting
- Interface responsiva (React)
- API RESTful

---

## Organização do Código

- **controllers/**: Lógica das rotas (ex: albumController.js, userController.js)
- **models/**: Modelos de dados (ex: user.js, playlist.js)
- **routes/**: Definição das rotas da API (ex: userRoutes.js, musicRoutes.js)
- **middlewares/**: Middlewares de autenticação, validação, etc.
- **utils/**: Funções utilitárias (ex: logger.js)
- **config/**: Configuração da base de dados

---

## Endpoints API

Exemplo de endpoints principais (ver cada ficheiro em `src/routes/` para detalhes):

- **/auth/**
  - `POST /register` - Registar novo utilizador
  - `POST /login` - Login de utilizador

- **/user/**
  - `GET /:id` - Obter dados do utilizador
  - `PUT /:id` - Atualizar utilizador

- **/music/**
  - `GET /` - Listar músicas
  - `POST /` - Adicionar música

- **/playlist/**
  - `GET /` - Listar playlists
  - `POST /` - Criar playlist

- **/subscription/**
  - `GET /` - Listar subscrições
  - `POST /` - Criar subscrição

- **/search/**
  - `GET /` - Pesquisar músicas/artistas

*(Ver rotas específicas para mais detalhes.)*

---

## Segurança

- **Autenticação:** JWT para autenticação de utilizadores.
- **Autorização:** Verificação de permissões em rotas sensíveis.
- **CSRF:** Proteção contra CSRF em formulários.
- **Rate Limiting:** Limitação de requisições para prevenir abusos.

---

## Boas Práticas e Convenções

- **Estrutura de Pastas:** Manter a estrutura de pastas organizada e modular.
- **Nomenclatura:** Usar nomes descritivos e consistentes para variáveis, funções e arquivos.
- **Comentários:** Comentar código complexo e manter um estilo de codificação consistente.
- **Documentação:** Manter a documentação atualizada e clara.

---

## Testes e Logging

- **Testes:** Testes unitários e de integração com Jest e Supertest.
- **Logging:** Logs de erro e informação com Winston, armazenados em ficheiros.

---

## Licença

Projeto privado, desenvolvido no âmbito do projeto final do curso.

