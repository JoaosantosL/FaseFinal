# Estrutura de Autenticação — SoundDream

Este documento descreve a arquitetura e o fluxo de autenticação implementados no projeto SoundDream, detalhando os principais ficheiros, middlewares e práticas de segurança adotadas.

---

## 1. Visão Geral

A autenticação do SoundDream é baseada em **JWT (JSON Web Tokens)**, armazenados em cookies HttpOnly, garantindo segurança contra ataques XSS. O sistema inclui proteção CSRF, validação de permissões e renovação de sessão.

---

## 2. Estrutura de Ficheiros Relacionados

### Backend (`/Backend/src/`)

- **controllers/authController.js**  
  Lógica dos endpoints de autenticação (registo, login, logout, renovação de sessão, etc).

- **routes/authRoutes.js**  
  Define as rotas públicas de autenticação, como `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`.

- **middleware/auth.js**  
  Middleware para validar o JWT, proteger rotas privadas e anexar o utilizador autenticado ao pedido.

- **middleware/csrf.js**  
  Middleware para validação do token CSRF em operações sensíveis.

- **models/user.js**  
  Modelo de utilizador, incluindo métodos para hashing de password e validação.

- **validators/authValidator.js**  
  Esquemas Joi para validação dos dados de registo e login.

---

### Frontend (`/FrontEnd/src/`)

- **context/AuthContext.js**  
  Contexto global que gere o estado de autenticação do utilizador (login, logout, dados do utilizador, etc).

- **services/authService.js**  
  Funções para chamadas à API de autenticação (login, registo, logout, obter utilizador atual).

- **components/Login.jsx / Register.jsx**  
  Formulários de login e registo, com validação e feedback visual.

---

## 3. Fluxo de Autenticação

### a) Registo

1. O utilizador preenche o formulário de registo no frontend.
2. O frontend envia um `POST` para `/auth/register` com os dados.
3. O backend valida os dados (Joi), cria o utilizador, faz hash da password e guarda na base de dados.
4. O backend responde com sucesso ou erro.

### b) Login

1. O utilizador preenche o formulário de login.
2. O frontend envia um `POST` para `/auth/login`.
3. O backend valida as credenciais, gera um JWT e envia-o num cookie HttpOnly.
4. O frontend atualiza o estado de autenticação via `AuthContext`.

### c) Sessão e Proteção de Rotas

- O JWT é enviado automaticamente em cada pedido (cookie HttpOnly).
- O middleware `auth.js` valida o token e permite acesso apenas a utilizadores autenticados.
- O frontend verifica o estado de autenticação para proteger rotas privadas.

### d) Logout

1. O utilizador clica em "Logout".
2. O frontend faz um pedido `POST` para `/auth/logout`.
3. O backend remove o cookie JWT.
4. O frontend limpa o estado de autenticação.

---

## 4. Segurança

- **JWT em Cookie HttpOnly:**  
  Protege contra XSS, pois o token não é acessível via JavaScript.
- **CSRF Token:**  
  Todas as operações de alteração de dados exigem um token CSRF válido.
- **Validação de Dados:**  
  Uso de Joi para garantir que apenas dados válidos são processados.
- **Hashing de Passwords:**  
  Passwords nunca são guardadas em texto simples (bcrypt).

---

## 5. Resumo dos Endpoints de Autenticação

- `POST /auth/register` — Registo de novo utilizador
- `POST /auth/login` — Login e emissão de JWT
- `POST /auth/logout` — Logout e remoção do JWT
- `GET /auth/me` — Obter dados do utilizador autenticado

---

Esta estrutura garante uma autenticação robusta, segura e alinhada com as melhores práticas