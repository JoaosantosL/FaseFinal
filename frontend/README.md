# 📄 Documentação Técnica — Frontend (React)

## Changelog

-   **2025-06-09** — Comentários JSDoc adicionados a todos os ficheiros React
-   **2025-06-09** — Comentários didáticos incluídos no código de cada componente
-   **2025-06-09** — Secção de segurança (CSRF e JWT HttpOnly) documentada
-   **2025-06-09** — Explicação do leitor global de música (`MusicContext`)
-   **2025-06-09** — Estrutura de pastas e boas práticas descritas
-   **2025-06-21** — Favoritos, Search e Shuffle

## Estrutura de Ficheiros

```
/src
├── App.jsx                      # Componente principal com as rotas
├── index.js                    # Ponto de entrada da aplicação
├── /components                 # Componentes reutilizáveis
│   ├── MusicCard.jsx
│   ├── MusicPlayer.jsx
│   ├── MusicListItem.jsx
│   ├── SearchBar.jsx
│   ├── Navbar.jsx
│   └── AddToPlaylistModal.jsx
├── /context                    # Contextos globais (estado)
│   ├── AuthContext.js
│   └── MusicContext.js
├── /pages                      # Páginas principais
│   ├── Home.jsx
│   ├── Library.jsx
│   ├── Playlists.jsx
│   ├── PlaylistDetail.jsx
│   ├── Login.jsx
│   ├── AlbumDetail.jsx
│   ├── LikedSongs.jsx
│   ├── SearchResults.jsx
│   └── Register.jsx
├── /services
│   └── axios.js                # Instância Axios configurada
├── /utils
│   └── getCsrfToken.js         # Função auxiliar para CSRF
├── /styles
│   └── theme.css               # Estilos globais com variáveis CSS
```

## Autenticação

-   Utiliza Context API (`AuthContext`) para guardar estado de `user`, `setUser`, `isLoading`.
-   A autenticação usa cookies HttpOnly com JWT.
-   Pedidos `POST /auth/login` e `POST /auth/register` requerem token CSRF via `X-CSRF-Token`.

## Leitor Global de Música

-   O `MusicContext` gere:
    -   `currentMusic`
    -   `isPlaying`, `togglePlayPause`
    -   `queue`, `currentIndex`, `history`
-   O componente `MusicPlayer.jsx` é fixo no fundo da página com:
    -   Capa, título, artista
    -   Controlo de tempo
    -   Botões anterior/seguinte/play-pause/shuffle
    -   Barra de progresso clicável

## Biblioteca Pessoal

-   Página `Library.jsx` mostra músicas guardadas.
-   Permite tocar todas, ver reações pessoais, e remover da biblioteca.
-   Integra-se com `MusicCard.jsx` e `MusicContext`.

## Playlists

-   Página `Playlists.jsx` permite:
    -   Criar nova playlist
    -   Editar nome
    -   Eliminar playlist
-   Página `PlaylistDetail.jsx` mostra músicas dessa playlist, com opção de tocar ou remover.

## Favoritos

-   Página `LikedSongs.jsx` lista músicas que o utilizador marcou como favoritas.
-   Usa `MusicListItem.jsx` para mostrar cada música numa lista.

## Pesquisa

-   Página `SearchResults.jsx` permite pesquisar músicas, artistas e álbuns.
-   Usa `SearchBar.jsx` para capturar input do utilizador.

## Componentes Reutilizáveis

### `MusicCard.jsx`

-   Mostra capa, título, artista, álbum, e número de `plays`.
-   Permite tocar, guardar/remover da biblioteca, adicionar/remover de playlist.

### `MusicPlayer.jsx`

-   Reprodutor global com progress bar, botões, info da música.

### `AddToPlaylistModal.jsx`

-   Modal com dropdown de playlists do utilizador.
-   Integração CSRF e Axios.

### `MusicListItem.jsx`

-   Componente para listar músicas com capa, título, artista e ações (tocar, adicionar/remover da biblioteca).

### `SearchBar.jsx`

-   Componente de pesquisa reutilizável para pesquisar.

## Axios Configurado

-   Ficheiro: `/services/axios.js`
-   Base URL definida via `.env`
-   `withCredentials: true`
-   Interceptor de erros: mostra mensagens uniformes no `console` (pode ser adaptado para toast)

## Segurança no Cliente

-   Token CSRF necessário para todas as mutações (POST, PATCH, DELETE)
-   `getCsrfToken.js` encapsula a lógica
-   Axios envia `X-CSRF-Token` em headers
-   JWT nunca acessível no frontend (HttpOnly)

## Roteamento e Proteção

-   Usa `react-router-dom` com `PrivateRoute` em `App.jsx`
-   Garante que páginas como `/library`, `/playlists`, `/` só estão acessíveis se `user` estiver autenticado.

## Boas Práticas

-   Modularização e separação de responsabilidades
-   CSS com variáveis e estilo consistente (`theme.css`)
-   Feedback visual com `react-toastify`
-   JSDoc em todos os ficheiros, funções e componentes principais
-   Comentários didáticos integrados no código

## Observações Finais

-   Este frontend está pronto para produção com CSRF, JWT HttpOnly e lógica robusta de autenticação e reprodução.
-   O design é responsivo e adaptado ao mobile-first, com suporte completo a interação por toque e scroll fluido.
