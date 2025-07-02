# CONVENÇÕES DE DESENVOLVIMENTO - SoundDream 
*Última atualização: 30/05/2025*
Este documento define as principais convenções de código, organização e boas práticas a seguir no desenvolvimento do projeto.


## Estrutura de Pastas

- **client/**: Código do frontend (React).
- **server/**: Código do backend (Node.js/Express).
- **docs/**: Documentação do projeto.
- **Cada (controllers, models, routes, middlewares, utils, etc.) tem a sua própria pasta.**

---

## Nomenclatura de Ficheiros e Pastas

- **Ficheiros JavaScript:** usar camelCase (ex: `userController.js`, `musicRoutes.js`).
- **Modelos Mongoose:** nome singular e com inicial maiúscula (ex: `User`, `Playlist`).
- **Pastas:** usar minúsculas e, se necessário, separar por hífen (ex: `middlewares`, `config`).
- **Componentes React:** PascalCase (ex: `HomePage.js`, `PlaylistCard.js`).

---

## Estilo de Código

- **Indentação:** 2 espaços (sem tabs).
- **Aspas:** usar aspas simples `'` para strings em JS.
- **Ponto e vírgula:** obrigatório no final de cada instrução.
- **Chaves:** abrir sempre na mesma linha.
- **Linhas em branco:** usar para separar blocos lógicos.
- **Variáveis:** usar `const` por padrão, `let` apenas se necessário.

---

## Comentários

- **Comentário de bloco** no topo de cada ficheiro com descrição e autor (exemplo abaixo).
- **Comentário de linha** para explicar partes complexas do código.
- **Evitar comentários redundantes** (explicar o porquê, não o óbvio).

```js
/**
 * @file userController.js
 * @description Controlador para operações de utilizador.
 */
```

---

## Commits e Versionamento

- **Mensagens de commit** devem ser curtas e descritivas, no entanto foi feita essa alteração a meio do desenvolvimento.
- **Não commitar ficheiros sensíveis** (ex: `.env`, passwords).

---

## Boas Práticas Gerais

- **Validar sempre dados recebidos do utilizador** (no backend e frontend).
- **Usar middlewares para autenticação e tratamento de erros.**
- **Utilizar variáveis de ambiente para configurações sensíveis.**
- **Documentar endpoints e funcionalidades novas.**
- **Seguir as convenções deste documento para garantir consistência.**

---

