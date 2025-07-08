# Fluxo das Funcionalidades — Relatório do Projeto SoundDream

Este capítulo descreve o fluxo de funcionamento das principais funcionalidades implementadas no SoundDream, detalhando a interação entre o utilizador, o frontend (React) e o backend (Node.js/Express/MongoDB). O objetivo é demonstrar como cada ação do utilizador é processada de forma segura, eficiente e integrada.

---

## 1. Adicionar uma Música (Admin/Artista)

O processo de adicionar uma nova música é restrito a utilizadores com permissões especiais (admin ou artista). O fluxo é o seguinte:

- **No frontend**, o utilizador preenche um formulário com os dados da música (título, artista, álbum, ficheiro de áudio, capa, etc.).
- Ao submeter, o frontend envia um pedido `POST` para o endpoint `/music`, incluindo os dados do formulário (em formato `multipart/form-data`), o token CSRF e o cookie JWT para autenticação.
- **No backend**, o pedido passa por vários middlewares:
  - Autenticação (JWT)
  - Validação CSRF
  - Processamento de ficheiros (multer)
  - Validação dos dados (Joi)
- Se todos os critérios forem cumpridos, a música é guardada na base de dados e os ficheiros são armazenados no servidor.
- O backend responde ao frontend, que apresenta feedback ao utilizador e atualiza a interface conforme necessário.

---

## 2. Adicionar uma Música a uma Playlist

Esta funcionalidade permite ao utilizador organizar as suas músicas em playlists personalizadas.

- O utilizador seleciona uma música e escolhe a opção "Adicionar à Playlist".
- Um modal apresenta as playlists disponíveis do utilizador, obtidas via API.
- Após selecionar a playlist, é enviado um pedido `POST` para `/playlist/:playlistId/add`, contendo o ID da música, token CSRF e cookie JWT.
- O backend valida a autenticidade do pedido, verifica se a playlist pertence ao utilizador e adiciona a música à playlist na base de dados.
- O frontend recebe a resposta e atualiza a interface, mostrando feedback ao utilizador.

---

## 3. Marcar uma Música como Favorita

O utilizador pode marcar/desmarcar músicas como favoritas, facilitando o acesso rápido às suas preferidas.

- Ao clicar no ícone de "like", o frontend envia um pedido `POST` ou `PATCH` para `/favorites/:musicId`, incluindo o token CSRF e o cookie JWT.
- O backend valida o pedido e atualiza o array de favoritos do utilizador na base de dados.
- O frontend reflete a alteração no botão e apresenta feedback visual.

---

## 4. Reproduzir uma Música

A reprodução de músicas é central na experiência do SoundDream.

- O utilizador clica em "play" numa música, o que atualiza o estado do MusicPlayer global no frontend.
- O ficheiro de áudio é carregado a partir do backend e começa a reprodução.
- Opcionalmente, o frontend pode registar a reprodução no histórico do utilizador através de um pedido `POST` para `/history`.
- O backend regista a ação e pode atualizar estatísticas de reprodução.

---

## 5. Criar uma Playlist

Os utilizadores podem criar playlists personalizadas para organizar as suas músicas.

- O utilizador clica em "Nova Playlist", preenche o nome e, opcionalmente, uma capa.
- O frontend envia um pedido `POST` para `/playlist` com os dados, token CSRF e cookie JWT.
- O backend valida e cria a playlist associada ao utilizador, respondendo com os dados da nova playlist.
- O frontend atualiza a lista de playlists e apresenta feedback ao utilizador.

---

## Considerações de Segurança e Validação

- **Autenticação:** Todas as operações protegidas requerem autenticação via JWT (armazenado em cookie HttpOnly).
- **CSRF:** Todas as operações de alteração de dados exigem um token CSRF válido.
- **Validação:** O backend valida rigorosamente todos os dados recebidos, utilizando Joi e sanitização de entradas.
- **Feedback:** O frontend utiliza notificações (toasts) e atualizações de estado para garantir uma experiência de utilizador clara e responsiva.
- **Uploads:** Os ficheiros enviados são tratados por `multer` e armazenados em diretórios próprios no servidor.

---

Este fluxo garante que todas as funcionalidades são executadas de forma segura, eficiente e com uma experiência de utilizador consistente, respeitando as melhores práticas de desenvolvimento web. Para mais detalhes sobre a implementação técnica, consulte a documentação do código e os comentários inline nas partes relevantes do projeto.