# ROLES.md
*Última atualização: 30/05/2025*
"CARGOS" do sistema e permissões por tipo de utilizador.

---

## "CARGOS" disponíveis

-   **user** — Utilizador comum, pode ouvir músicas, gerir biblioteca e playlists
-   **artist** — Utilizador com perfil artístico e álbuns associados
-   **admin** —  pode aprovar músicas e gerir sistema

---

## Permissões por ação

| Ação                                     | user | artist | admin |
| ---------------------------------------- | :--: | :----: | :---: |
| Ver músicas do repositório global        |  ✅  |   ✅   |  ✅   |
| Adicionar à biblioteca pessoal           |  ✅  |   ✅   |  ✅   |
| Criar/editar playlists                   |  ✅  |   ✅   |  ✅   |
| Ver perfil de artista e álbuns           |  ✅  |   ✅   |  ✅   |
| Submeter nova música                     |  ❌  |   ⚠️   |  ✅   |
| Editar perfil de artista (bio, imagem)   |  ❌  |   ✅   |  ✅   |
| Ver biblioteca pessoal                   |  ✅  |   ✅   |  ✅   |
| Aprovar ou rejeitar submissões de música |  ❌  |   ❌   |  ✅   |
| Ver estatísticas globais de utilização   |  ❌  |   ❌   |  ✅   |

---

## Considerações

-   O papel do utilizador autenticado (`req.user.role`) é verificado via middleware `authorizeRole(...)`
-   A propriedade dos recursos é verificada com `checkOwnership` em endpoints sensíveis:
    -   Playlists: apenas o criador pode editar ou apagar
    -   Biblioteca: apenas o dono pode modificar
-   A autorização está **separada** da autenticação (`verifyToken`)
-   O middleware pode ser combinado: `verifyToken + authorizeRole + checkOwnership`
-   Apenas os campos seguros são expostos em rotas públicas (`.select()`, `.lean()`)
-   O papel `admin` será usado em endpoints reservados para moderação/validação futura;
-   Atualmente, os artistas têm perfil e álbuns visíveis publicamente.
-   A submissão de conteúdos artísticos está prevista para breve. (ex: `isArtistOf(...`).
-   /api/music, /api/artists, /api/albums, etc., são acessíveis a todos — independentemente do role

