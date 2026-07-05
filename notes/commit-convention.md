# Convenção de commits

Gitmoji + Conventional Commits, mensagens em português. Todo commit segue
este formato:

```txt
<gitmoji> <tipo>(<escopo opcional>): <descrição curta, no imperativo>

<corpo opcional — explica o porquê, não o o quê>

<rodapé opcional — BREAKING CHANGE, referência a issue, etc.>
```

## Regras da linha de assunto

- Imperativo ("adiciona", não "adicionado" ou "adicionando").
- Minúscula depois dos dois-pontos, sem ponto final.
- Até ~72 caracteres.
- Escopo é opcional e deve nomear a área tocada (ex.: `queries`, `charts`,
  `sidebar`, `dbt`, `deps`), não o arquivo inteiro.

## Corpo e rodapé

- Só adicione corpo quando o "porquê" não for óbvio pela mensagem curta
  (mesma regra de comentários no código — ver `CLAUDE.md`).
- `BREAKING CHANGE: <descrição>` no rodapé quando a mudança quebra
  compatibilidade (schema de dados, rota, contrato de componente).
- Referencie decisões de `notes/backlog.md` ou `ROADMAP.md` quando o commit
  fechar ou abrir um item lá, em vez de duplicar o contexto na mensagem.

## Tipos e gitmoji

| Gitmoji | Tipo | Quando usar |
| --- | --- | --- |
| ✨ | `feat` | Nova funcionalidade ou tela |
| 🐛 | `fix` | Correção de bug |
| 📝 | `docs` | Documentação (`CLAUDE.md`, `README.md`, `reference/`, `notes/`) |
| 💄 | `style` | CSS/Tailwind, tokens de design, ajuste visual sem mudar lógica |
| ♻️ | `refactor` | Reorganização de código sem mudar comportamento observável |
| ⚡️ | `perf` | Melhoria de performance (query, cache, agregação) |
| ✅ | `test` | Testes novos ou corrigidos |
| 🔧 | `chore` | Configuração de tooling (tsconfig, eslint, tailwind, next.config) |
| 📦 | `build` | Dependências, scripts de build, `package.json` |
| 👷 | `ci` | Integração contínua |
| ⏪ | `revert` | Reverter um commit anterior |
| 🔥 | `remove` | Remover código, arquivo ou funcionalidade |
| 🚚 | `move` | Mover ou renomear arquivo/pasta |
| 🔒 | `security` | Correção ou reforço de segurança |
| ⬆️ | `deps-up` | Atualizar versão de dependência |
| ⬇️ | `deps-down` | Rebaixar versão de dependência |
| 🗃️ | `db` | Mudança de schema, query isolada ou proposta de model dbt |
| 🚧 | `wip` | Trabalho em andamento (evitar em `main`; ok em branch de feature) |

Se nenhum tipo encaixar bem, é sinal de que o commit está fazendo mais de
uma coisa — considere dividir em commits menores antes de forçar um tipo.

## Exemplos

```txt
✨ feat(municipios): implementar Visão Geral com dados reais do Postgres

🐛 fix(producao): usar janela móvel de 12 meses em vez de média histórica

Sem o LIMIT, media12m diluía conforme mais competências eram carregadas,
tornando o rótulo "últimos 12 meses" da tela incorreto.

📝 docs: extrair design system e inventário de páginas de reference/

✅ test(queries): cobrir mappers de estabelecimentos e internações

🔧 chore: inicializar projeto Next.js com Tailwind v4 e shadcn/ui
```

## O que este projeto NÃO automatiza

Commits **não são criados automaticamente** por IA neste projeto — só
quando o usuário pedir explicitamente, mesmo ao final de uma tarefa grande
ou de uma rodada de correções. Ver `CLAUDE.md` para as demais regras de
colaboração com IA.
