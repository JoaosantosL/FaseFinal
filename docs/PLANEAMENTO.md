# 📑 PLANEAMENTO ATUALIZADO

## Estado do Projeto

| ✅ Já Implementado                                      | ⏳ Por Fazer / Melhorar                                 |
|--------------------------------------------------------|--------------------------------------------------------|
| Estrutura base de pastas e ficheiros (MVC, routes, etc)| Rotas e controladores de administração (`adminRoutes`) |
| Autenticação (rotas, controladores, JWT, middleware)   | Testes automatizados (unitários/integrados)            |
| Modelos de Music, Album, Artist, Playlist, User        | Documentação Swagger/OpenAPI da API                    |
| Rotas e controladores de músicas, álbuns, artistas     | Endpoints avançados: favoritos, histórico, partilha    |
| Rotas e controladores de playlists                     | Upload de músicas por artistas                         |
| Rotas e controladores de assinaturas                   | Funcionalidades premium (planos, pagamentos)           |
| Middleware de validação, autenticação e rate limiting  | Melhorias de segurança e robustez                      |
| Logging com Winston e ficheiros de log                 | Aprimorar frontend: UI/UX, responsividade, player      |
| Upload de ficheiros (músicas, capas)                   | Preparação para deploy (Docker, seeders, scripts)      |
| Integração frontend-backend (API RESTful)              | Testes end-to-end (E2E) e mocks                       |
| Documentação inicial (README, API-ENDPOINS, MODELOS)   | Monitorização e alertas em produção                    |

---

## Sugestões de Próximos Passos

1. Implementar rotas e controladores de administração (gestão de utilizadores, conteúdos, planos).
2. Adicionar testes automatizados (unitários e integrados) para backend e frontend.
3. Documentar endpoints com Swagger/OpenAPI para facilitar integração e manutenção.
4. Aprimorar funcionalidades de playlists, biblioteca e favoritos.
5. Refinar UI/UX e responsividade do frontend (melhorar player, navegação, mobile).
6. Implementar uploads de músicas por artistas autenticados.
7. Adicionar funcionalidades premium (planos, pagamentos, restrições de acesso).
8. Melhorar segurança: validação extra, sanitização, proteção contra XSS/CSRF.
9. Preparar scripts de seed e deploy (Docker, CI/CD).
10. Implementar monitorização e alertas para ambiente de produção.

---

## Notas

- Priorizar testes e documentação para facilitar manutenção.
- Validar e sincronizar índices MongoDB em produção.
- Garantir que variáveis de ambiente sensíveis não são expostas.
- Manter logs organizados e monitorar erros críticos.
- Revisar permissões e roles antes do deploy