# Roadmap — RadarSUS Municipal (frontend)

Sequência de marcos para sair do estado atual (repositório vazio + design
extraído) até o produto final descrito em `CLAUDE.md`. Baseado em:

```txt
reference/design-system.md   padrões visuais
reference/paginas.md         inventário de páginas
```

Cada fase só deve começar quando a anterior atende aos "Critérios de aceite"
do `CLAUDE.md`. Ideias que surgirem fora de ordem vão para
`notes/backlog.md`, não para o meio de uma fase em andamento.

## Fase 0 — Fundação do projeto

Objetivo: ter um projeto Next.js rodando com a estrutura de pastas do
`CLAUDE.md` e o design system implementado como tokens reais, antes de
qualquer tela.

- Scaffold Next.js (App Router, TypeScript, Tailwind, ESLint/Prettier).
- Instalar shadcn/ui e adicionar os componentes base necessários: Card,
  Button, Select, Badge, Table, DropdownMenu, Tabs, Skeleton, Tooltip,
  Dialog, Sheet.
- Configurar fontes via `next/font`: Space Grotesk, IBM Plex Sans, IBM Plex
  Mono (ver `design-system.md`).
- Estender o tema do Tailwind com os tokens de cor, radius e spacing de
  `design-system.md` (não hardcode hex nos componentes depois disso).
- Criar `lib/db/` com conexão Postgres via variável de ambiente (sem
  `NEXT_PUBLIC_`), a partir de `.env.local`.
- Criar estrutura vazia de pastas: `components/{layout,cards,charts,tables,
  alerts,filters,ui}`, `lib/{db,queries,formatters,validators,utils}`,
  `types/`, `tests/`, `notes/`.

**Pronto quando**: `npm run dev` sobe uma página em branco com o tema
carregado (fontes e cores corretas), conexão com Postgres testável, sem
nenhuma tela de produto ainda.

## Fase 1 — Casca de layout e componentes-base de design system

Objetivo: montar o "chrome" da aplicação (sidebar + header + grid de
conteúdo) e os componentes visuais reutilizáveis descritos em
`design-system.md`, ainda sem dados reais.

- `components/layout/app-sidebar.tsx` — navegação fixa com os 7 itens
  confirmados em `paginas.md` (Visão geral, Rede e CNES, Atenção Primária,
  Produção, Alertas, Comparador, Relatório IA), estado ativo, badge de
  alertas, bloco de "última atualização" e perfil de usuário.
- `components/layout/dashboard-header.tsx`, `page-shell.tsx`,
  `content-grid.tsx`.
- `components/cards/kpi-card.tsx`.
- Badge de status reutilizável (sucesso/atenção/crítico) — usado por alertas
  e tabelas.
- `components/alerts/alert-card.tsx` + `alert-list.tsx`.
- `lib/formatters/` (number, percent, date, competencia) — usados por todos
  os componentes acima nos exemplos com dados mock.
- Estados visuais padrão (loading/skeleton, vazio, erro) para KPI card e
  lista de alertas.

**Pronto quando**: dá para montar visualmente as telas de `paginas.md` com
dados mock, e o resultado bate com `design-system.md` (cores, tipografia,
espaçamento, ausência de sombra em card padrão).

~~Fase 2~~ ✅ concluída em 2026-07-05 — nota real: os schemas do `CLAUDE.md`
(`gold_dashboard`/`marts_dashboard`) não existem; o schema real é `marts`.
Vários KPIs do protótipo original não têm dado hoje (cobertura APS, equipes
ESF, população IBGE, % ICSAP) — registrados em `notes/backlog.md` como
propostas de dbt, não inventados no frontend.

## Fase 2 — Camada de dados para a Visão Geral

Objetivo: ligar a primeira tela real ao Postgres/dbt, sem inventar schema.

- Consultar `/home/moscarde/raio-x-engenharia/models/` (e `dbt_project.yml`,
  `README.md`, `ROADMAP.md`) para confirmar quais views de
  `gold_dashboard`/`marts_dashboard`/`analytics` já cobrem: resumo do
  município, série mensal de produção ambulatorial, alertas priorizados,
  contagem de unidades por tipo, indicadores Previne Brasil do
  quadrimestre.
- Se algo não existir pronto, registrar sugestão de model/view no dbt
  (seção "Quando propor mudança no dbt" do `CLAUDE.md`) em vez de fazer a
  agregação no frontend.
- `types/` para os dados de domínio (ex.: `MunicipioResumo`,
  `ProducaoMensalPoint`, `AlertaPrioritario`, `IndicadorAps`).
- `lib/queries/` com uma consulta pequena e isolada por necessidade de tela.
- `lib/validators/` para `municipioId` e período vindos da URL.

**Pronto quando**: existe pelo menos uma função em `lib/queries/` retornando
dado real tipado para um município real, com teste de mapeamento SQL → tipo.

~~Fase 3~~ ✅ concluída em 2026-07-05 — página real em
`app/municipios/[municipioId]/page.tsx` com dado real (Paraty, Rio de
Janeiro, Nova Iguaçu), gráfico Recharts, seletor de município funcional,
`loading.tsx`/`error.tsx`. KPIs sem dado real (cobertura APS, equipes ESF)
usam o estado "dado pendente" em vez de valor inventado.

## Fase 3 — Página Visão Geral (Raio-X Municipal)

Objetivo: primeira página completa do produto.

- `app/municipios/[municipioId]/page.tsx` seguindo a estrutura descrita em
  `paginas.md`: header + 5 KPIs + gráfico de produção/alertas + rede
  instalada/indicadores APS + rodapé de fonte.
- `components/charts/producao-mensal-chart.tsx` (Recharts), com o padrão de
  barra + linha de média + destaque de anomalia de `design-system.md`.
- `components/charts/rede-instalada-bars.tsx`.
- `components/tables/indicadores-aps-table.tsx`.
- `components/filters/municipio-select.tsx`, `periodo-select.tsx`.
- Tratar loading, vazio ("dados ainda não disponíveis..."), erro e nulos —
  nunca `NaN`/`undefined` cru.

**Pronto quando**: atende aos "Critérios de aceite" do `CLAUDE.md` inteiros
para esta tela (tipada, camada de dados correta, sem dado sensível, estados
tratados, segue a referência visual, testada onde há lógica).

~~Fase 4~~ ✅ concluída em 2026-07-05 — `app/page.tsx` é uma escolha real
entre os 3 municípios com dado carregado (`getMunicipiosDisponiveis`), não
mais um redirect fixo. Sidebar já marcava item ativo real e badge de
alertas real (0) desde a Fase 3.

## Fase 4 — Navegação real e seleção de município

Objetivo: transformar as páginas isoladas em um produto navegável.

- `app/page.tsx`: entrada da aplicação — seleção de município (ou redirect
  para o último/único selecionado).
- Sidebar com item ativo real por rota, badge de alertas com contagem real
  (não mock).
- Filtros de município/período compartilháveis via search params.

**Pronto quando**: dá para abrir a aplicação, escolher um município e
navegar pela sidebar sem página quebrada (os itens ainda sem tela podem
apontar para um estado "em construção" temporário, não para 404).

~~Fase 5~~ ✅ concluída em 2026-07-05, com uma mudança de escopo explícita:
`app/comparador/page.tsx` compara os 3 municípios com dado real
diretamente lado a lado, em vez de simular um "pareamento" por
população/região/porte — o universo real de dados hoje é só esses 3
municípios, então pareá-los não teria sentido. Ver `notes/backlog.md` para
quando isso deixa de ser válido (mais municípios carregados no dbt).

## Fase 5 — Página Comparador

Objetivo: segunda tela completa do protótipo (`paginas.md`, seção
Comparador).

- Definir com o projeto de dados o critério de pareamento de municípios
  (população, região, porte de rede) — provavelmente precisa de view nova
  no dbt; não inventar a lógica de pareamento no frontend.
- `app/comparador/page.tsx` (ou rota aninhada — decidir durante a
  implementação, conforme nota em `paginas.md`).
- Componente de chip de seleção de município (novo, em
  `components/filters/`).
- Tabela comparativa lado a lado + gráficos de barra horizontal
  comparativos (novos, em `components/charts/`).
- Texto de insight/hipótese: decidir explicitamente se é regra determinística
  no dbt ou geração futura via IA (Fase 9) — não implementar como texto fixo
  no componente.

**Pronto quando**: mesmo padrão de critérios de aceite da Fase 3, aplicado
ao Comparador.

~~Fase 6~~ ✅ concluída em 2026-07-05 — `app/municipios/[municipioId]/
alertas/page.tsx` reaproveita `AlertList` com estado vazio honesto (nenhuma
regra de alerta implementada ainda). Link "Ver todos" da Visão Geral já
aponta para cá.

## Fase 6 — Alertas (lista completa)

Objetivo: tela dedicada de alertas, reaproveitando o componente já validado
na Visão Geral.

- `app/municipios/[municipioId]/alertas/page.tsx`.
- Filtros por severidade/tipo.
- Link "Ver todos" da Visão Geral passa a apontar para cá.

~~Fase 7~~ ✅ concluída em 2026-07-05, com uma decisão explícita de exceção
à ordem original: em vez de gerar uma nova rodada de mockup antes de
codar, as telas foram construídas direto a partir de
`reference/design-system.md` (já maduro e validado nas Fases 3/5/6) e do
dado real disponível em `marts.*`. "Rede e CNES" e "Auditor CNES" foram
tratados como a mesma tela (`rede-cnes`), por julgamento — não era uma
pergunta que dependia do projeto de dados. Relatório IA ficou como
placeholder informativo explicando a decisão de arquitetura pendente (não
é a Fase 9 completa, que segue pendente).

## Fase 7 — Rodada de design para páginas pendentes

Objetivo: as 4 telas citadas na navegação mas sem mockup (`paginas.md`):
Rede e CNES, Atenção Primária (Radar APS), Produção, Relatório IA.

- Antes de codar: gerar/validar mockup de cada uma (mesma ferramenta/estilo
  do `Radar SUS.dc.html`) e atualizar `reference/paginas.md` de ✅ pendente
  para pronto, com a mesma estrutura de seções usada nas fases 3 e 5.
- Esclarecer com o usuário se "Rede e CNES" e "Auditor CNES" (módulo citado
  na landing) são a mesma tela.
- Implementar cada uma seguindo o mesmo ciclo das fases 2–3 (camada de dados
  → página → estados → testes), uma por vez.

~~Fase 8~~ ✅ concluída em 2026-07-05 — `app/documentacao/page.tsx`
(metodologia real por fonte: CNES, SIA, SIH, SISAB) e
`app/qualidade-dados/page.tsx` (contagens reais via
`lib/queries/qualidade-dados.ts`, exceto o total de
`fct_producao_ambulatorial`, que usa estimativa de `pg_class.reltuples` —
um `count(*)` exato mede ~58s). Ambas linkadas no rodapé da sidebar.

## Fase 8 — Documentação e qualidade de dados

Objetivo: as páginas institucionais previstas no `CLAUDE.md` que não têm
mockup no protótipo de design, mas são parte explícita do escopo do projeto.

- `app/documentacao/page.tsx`: metodologia, fonte, granularidade, período,
  regra de cálculo e limitações de cada indicador.
- Página/componente de qualidade de dados: última atualização por fonte,
  total de registros, municípios cobertos, campos críticos nulos,
  duplicidades — todos vindos de models/views do dbt, não calculados ad-hoc
  no frontend.

## Fase 9 — Relatório executivo com IA

Objetivo: módulo citado tanto na landing quanto no CTA da Visão Geral, mas
que envolve uma decisão arquitetural não coberta pelo design system.

- Decidir: server action síncrona, fila assíncrona, ou serviço externo de
  IA — e onde a chamada a esse serviço fica encapsulada (não espalhar
  chamada a LLM por vários arquivos).
- Definir formato de saída (PDF, apresentação, ambos) e onde ele é gerado/
  armazenado.
- Implementar depois de todas as páginas de dado bruto existirem (Fases
  3–8), já que o relatório é uma camada de síntese sobre elas.

## Fase 10 — Landing comercial (opcional, decisão pendente)

Objetivo: avaliar se este repositório também hospeda a landing pública
(`paginas.md`, seção "Landing comercial") ou se ela vive em outro projeto.

- Não iniciar sem essa decisão explícita — não faz parte do escopo de
  "dashboards municipais" descrito no `CLAUDE.md`.

~~Fase 11~~ 🟡 parcialmente concluída em 2026-07-05 — o que já está feito:
`tsc`/lint/`npm run test`/`npm run build` limpos em todo o app; revisão de
segurança rápida (nenhuma credencial hardcoded, `.env.local` sempre
gitignored, só dado agregado exibido); todas as 9 rotas verificadas no
navegador sem erro de console. Falta: revisão de performance mais profunda
das novas queries pesadas (Comparador dispara `getProducaoMensal` para os
3 municípios em paralelo — cada uma cacheada separadamente, mas ainda vale
medir o pior caso de cache frio) e cobertura de teste mais ampla conforme
novas páginas amadurecerem.

## Fase 11 — Polimento e endurecimento

Objetivo: fechar os critérios gerais do `CLAUDE.md` antes de chamar o
projeto de pronto para portfólio/produto.

- Cobertura de testes para formatadores, validadores e mapeamento SQL → UI
  de todas as páginas.
- Revisão de segurança: nenhum dado individual identificável, nenhuma
  credencial versionada, nenhum log sensível.
- Revisão de performance na ordem sugerida pelo `CLAUDE.md`: query SQL →
  pré-agregação dbt → índice Postgres → volume de dado no client →
  client components desnecessários → granularidade de gráfico/tabela.
- Passar `npm run lint`, `npm run format`, `npm run test` limpos.

---

## Como usar este roadmap

- Trabalhar uma fase por vez; não pular para Fase 5+ sem Fases 0–4 prontas,
  já que cada uma depende da anterior (design system → dados → página →
  navegação).
- Ao concluir uma fase, marcar aqui (ex.: `~~Fase 0~~ ✅ concluída em
  AAAA-MM-DD`) para manter o roadmap como histórico de progresso, não só
  como plano.
- Decisões que abrem exceção à ordem (ex.: pular para o Comparador antes da
  Visão Geral estar 100%) devem ser explícitas, não silenciosas.
