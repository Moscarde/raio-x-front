# Backlog

Itens que dependem de decisão do usuário ou de outra rodada de design antes
de virarem tarefa de implementação. Ver `ROADMAP.md` para a sequência de
fases.

## Decisões pendentes

- **Rede e CNES vs. Auditor CNES**: são a mesma tela ou duas telas
  distintas? (`reference/paginas.md`, seção "Rede e CNES").
- **Landing comercial**: este repositório hospeda a landing pública
  (`reference/paginas.md`, mockup 1b) ou ela vive em outro projeto? Não
  faz parte do escopo de "dashboards municipais" do `CLAUDE.md`.
- **Relatório executivo com IA**: decidir arquitetura (server action
  síncrona, fila assíncrona, serviço externo) e formato de saída (PDF,
  apresentação) antes de iniciar a Fase 9 do `ROADMAP.md`.
- **Critério de pareamento de municípios** (Comparador): confirmar com o
  projeto de dados se já existe view no dbt para população/região/porte de
  rede semelhante, ou se precisa ser criada.

## Rodada de design pendente

Telas citadas na navegação da sidebar sem mockup ainda
(`reference/paginas.md`): Rede e CNES, Atenção Primária, Produção,
Relatório IA.

## Propostas para o dbt (`raio-x-engenharia`)

Encontradas ao implementar a Fase 2 do `ROADMAP.md` (camada de dados da
Visão Geral), consultando `dbt/models/marts/` e o Postgres real. Nenhum
schema/coluna foi inventado no frontend para cobrir essas lacunas — os
cards/tabelas afetados mostram estado "dado pendente" até o dbt expor o
dado. Ver `lib/queries/` para onde cada limitação aparece hoje.

- **Sugestão: criar `mart_producao_ambulatorial_mensal_municipio`**
  (grão: 1 linha por `id_municipio_estabelecimento` × `competencia_arquivo`).
  Motivo: `marts.fct_producao_ambulatorial` tem 99,9M+ linhas (SIA, RJ
  inteiro) sem pré-agregação por município; a query usada hoje em
  `lib/queries/producao-ambulatorial.ts` (filtra + agrupa em tempo de
  request) mede **5,6s** para 1 município (Paraty) — mitigado só
  parcialmente com `unstable_cache` (24h). Sem essa mart, toda primeira
  visita após expirar o cache paga esse custo.
- **Sugestão: seed/lookup de metas oficiais do Previne Brasil por
  `numero_indicador`**. Motivo: `mart_indicadores_aps` traz `percentual` e
  `percentual_quadrimestre`, mas nenhuma coluna de meta oficial — a tabela
  de indicadores da Visão Geral não pode calcular status
  (Meta ok/Atenção/Crítico) sem inventar limiar no frontend.
- **Sugestão: coluna de população total do município em `dim_municipio`**
  (fonte IBGE, estimativa populacional). Motivo: hoje não existe nenhuma
  população em `dim_municipio`; `mart_indicadores_aps.populacao` é a
  população de referência do SISAB para cálculo de cobertura APS
  (denominador de indicador), não a população total do município — usar
  uma no lugar da outra sem nota seria enganoso.
- **Sugestão: lista de classificação ICSAP (CID-10) para
  `fct_internacoes.diagnostico_principal`**. Motivo: a % de internações por
  condição sensível à atenção primária não é calculável hoje —
  `diagnostico_principal` é o código CID-10 cru, sem de-para (mesma
  limitação já registrada para CID-10/CBO em `ROADMAP_DBT.md`, "fora do
  MVP").
- **Observação, não proposta de mudança**: `dim_estabelecimento` é um
  snapshot único (CNES dezembro/2025), sem coluna de situação/atualização
  por unidade — não dá para reconstruir o alerta "N unidades sem
  atualização há mais de 6 meses" do protótipo sem uma série histórica de
  cadastro, que exigiria recarregar múltiplas competências do CNES (mudança
  de escopo de coleta, não só de dbt).
