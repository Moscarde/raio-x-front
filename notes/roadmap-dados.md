# Roadmap de consumo das novas fontes de dados

Entre 2026-07-12 e 2026-07-13 o `raio-x-engenharia` implementou as 11
demandas de dados registradas pelo frontend (ver
`raio-x-engenharia/ROADMAP.md`, seção "Demandas de dados do frontend", e
`ROADMAP_DBT.md`, Etapas 9–16): 8 marts novas em `marts`, 3 colunas novas em
`marts.mart_indicadores_aps`, e enriquecimento de `marts.dim_estabelecimento`
via DEMAS. `notes/backlog.md` só documentava 6 dessas demandas (registradas
antes dessa entrega, na Fase 2 deste projeto). Este documento fecha a
lacuna: mapeia cada mart nova para a tela que ela desbloqueia e prioriza a
ordem de implementação.

Nenhuma dessas marts exige trabalho adicional no dbt — todas já são
`+materialized: table` no schema `marts`. O gap é inteiramente do lado do
frontend (query + tipo + componente + página).

## Fase 0 — Correção urgente: query de produção quebrada (bug) ✅ feita nesta sessão

`lib/queries/producao-ambulatorial.ts` referenciava
`marts.mart_producao_ambulatorial_mensal_municipio`, tabela que não existe
mais no schema atual — a chamada caía silenciosamente no fallback
`getProducaoMensalOrEmpty`, então a página de Produção (e o Comparador, que
usa a mesma função) mostrava produção vazia mesmo havendo dado real no
banco. Corrigido:

- `buscarProducaoMensal` agora agrega `marts.mart_producao_grupo_municipio`
  por `competencia_date`, com `to_char(competencia_date, 'YYYYMM')` para
  preservar o contrato de tipo que `formatCompetencia` espera.
- `buscarProducaoPorGrupo` trocou de varrer `fct_producao_ambulatorial`
  (99,9M+ linhas, ~5,8s medido) para consultar a mart pré-agregada, e passou
  a expor `descricao_grupo` (nome legível do grupo SIGTAP, via
  `seed_sigtap_grupo` do dbt) em vez de só o código de 2 dígitos.
- `types/producao-ambulatorial.ts`, `components/charts/producao-por-grupo-bars.tsx`,
  o rodapé de `app/municipios/[municipioId]/producao/page.tsx` e
  `tests/queries/producao-por-grupo.test.ts` atualizados de acordo.

## Fase 1 — Alertas priorizados (`marts.mart_alertas_saude`) ✅ concluída em 2026-07-13

Hoje `app/municipios/[municipioId]/alertas/page.tsx` é 100% estático
(`alertas={[]}`, com texto explicando que nenhuma regra existe ainda). A
mart nova já cobre 3 regras reais: SIOPS abaixo do mínimo constitucional
(LC 141/2012), rede CNES com possível encerramento, financiamento líquido
negativo (`id_alerta`, `codigo_regra`, `severidade`, `id_municipio`,
`periodo_referencia`, `evidencia`, `status` sempre `"ativo"` — mart é
full-refresh sem histórico de execuções).

- Nova `lib/queries/alertas.ts` consultando a mart; `types/alerta.ts`
  (`AlertaPrioritario`, `AlertaSeveridade`) já existe — conferir se o shape
  bate ou precisa de ajuste.
- Ligar `AlertList` (já existe em `components/alerts/`) ao dado real na
  página de Alertas.
- `alertCount={0}` está hardcoded em 7 páginas (`app/comparador`,
  `municipios/[id]/page`, `producao`, `alertas`, `relatorio`,
  `atencao-primaria`, `rede-cnes`) — trocar pela contagem real. Não existe
  `app/municipios/[municipioId]/layout.tsx` hoje; cada página remonta o
  `AppSidebar` do zero. Vale avaliar introduzir esse layout para centralizar
  a busca de `alertCount` (elimina duplicação em 7 arquivos), mas não é
  obrigatório para a fase — pode ficar como refactor incremental.

## Fase 2 — Metas oficiais do Previne Brasil (`mart_indicadores_aps.status_meta`) ✅ concluída em 2026-07-13

`lib/queries/indicadores-aps.ts` já consulta essa mart mas não seleciona as
3 colunas novas: `parametro_percentual`, `meta_percentual`, `status_meta`
(`ok` / `atencao` / `critico`, já calculado no dbt).

- Estender a query e `types/indicador-aps.ts` com os 3 campos.
- `atencao-primaria/page.tsx`: mostrar `StatusBadge` (já existe em
  `components/alerts/status-badge.tsx`) por indicador/visão; remover a
  frase desatualizada "Metas oficiais... ainda não estão na camada de
  dados".
- Mesmo dado pode enriquecer `IndicadoresComparativoTable` no Comparador.
- Menor esforço de todo o roadmap — bom segundo passo depois dos Alertas.

## Fase 3 — Rede CNES: histórico + cadastro detalhado (`mart_historico_rede_cnes` + `dim_estabelecimento` enriquecida via DEMAS) ✅ concluída em 2026-07-13

`app/municipios/[municipioId]/rede-cnes/page.tsx` afirma hoje, no rodapé:
"sem série histórica... não há campo de situação... nem nome do
estabelecimento — só o código CNES". Não é mais verdade.

- Novo KPI "unidades possivelmente encerradas" via
  `mart_historico_rede_cnes.situacao_operacional = 'possivelmente_encerrado'`.
- Nova seção/tabela de auditoria de unidades desatualizadas por município.
- `EstabelecimentosTable` ganha colunas reais — `nome_fantasia`, `endereco`,
  `bairro` (hoje só código CNES), vindas do enriquecimento DEMAS em
  `dim_estabelecimento` (`latitude`/`longitude`, esfera administrativa e
  flags de centro cirúrgico/obstétrico/neonatal também disponíveis, todos
  nullable — nem todo estabelecimento está no cadastro complementar).
- Atualizar o texto de rodapé da página (desatualizado).
- Estender `lib/queries/estabelecimentos.ts` (ou nova
  `lib/queries/historico-rede-cnes.ts`) e `types/estabelecimento.ts`.

## Fase 4 — Cobertura APS e equipes ESF (`mart_cobertura_aps_municipio`)

1 linha por município (população estimada do IBGE + cobertura ESF %, via
cadastro vinculado homologado sem ponderação — única combinação que produz
percentual plausível ≤100%, conforme decisão registrada no
`ROADMAP_DBT.md` do dbt). Nenhuma tela consome hoje.

- Nova `lib/queries/cobertura-aps.ts` + tipo novo.
- KPIs novos (Cobertura ESF %, População estimada, Equipes ativas) —
  encaixam em Atenção Primária ou na Visão Geral do município; decidir ao
  implementar, olhando `reference/design-system.md` para o padrão de KPI
  card já estabelecido.

## Fase 5 — Internações ICSAP (`mart_icsap_municipio`)

`lib/queries/internacoes.ts` hoje só traz total de internações e
permanência média — `types/internacao.ts` não tem nenhum campo de ICSAP.

- Estender `ResumoInternacoes` (ou nova query) com
  `total_internacoes_icsap` / `percentual_icsap` (grão município de
  residência × ano).
- KPI novo na Visão Geral e/ou Comparador.
- Nota de limitação documentada no dbt: denominador é todas as internações,
  não só "internações clínicas" da metodologia oficial completa (SIH não
  captura tipo de AIH/complexidade/motivo de saída ainda) — replicar essa
  ressalva na UI, no mesmo padrão de nota de limitação já usado em
  `atencao-primaria/page.tsx`.

## Fase 6 — Detalhamento da APS por equipe/unidade (`mart_equipe_aps_detalhada`) ✅ concluída em 2026-07-13

1.659 linhas (equipe × unidade, com nome/endereço/bairro da unidade via
`dim_estabelecimento` e área/segmento de atuação da equipe). Nenhuma tela
consome.

- Nova seção na página Atenção Primária, com tabela paginada/limitada (ver
  regra do CLAUDE.md para listagens exploratórias) — ou nova sub-rota, a
  definir olhando `reference/paginas.md`.
- Sem indicador de desempenho por equipe (limitação documentada no dbt: a
  única fonte de indicador publica por tipo de equipe agregado ao
  município, não por `id_equipe` individual) — só atributos estruturais.

## Fase 7 — Comparador real entre municípios do RJ (`mart_comparacao_municipios_rj`)

`app/comparador/page.tsx` hoje compara só os 3 municípios com dado
carregado, direto, sem pareamento — o próprio código (`ResumoComparativoTable`)
documenta isso como decisão temporária até a mart existir. Ela existe agora:
92 municípios do RJ, com população estimada e porte de rede
(`estabelecimentos_por_10k_habitantes`), com `municipio_referencia`
marcando quais são os 3 do MVP.

- Fase de maior esforço de UX do roadmap: precisa decidir ranking? busca
  entre 92? scatter população × porte de rede? — os indicadores de
  desempenho (SISAB/ICSAP/financiamento) continuam restritos aos 3
  municípios de referência, então a comparação "profunda" de hoje não
  escala para os 92 sem essa decisão de produto. Checar
  `reference/paginas.md` (mockup do Comparador já existe) antes de
  implementar.
- Nova `lib/queries/comparacao-municipios.ts` + tipo novo.

## Fase 8 — Financiamento municipal (`mart_financiamento_saude_uniao` + `mart_financiamento_saude_siops` + `mart_repasses_fns`)

Única das 11 demandas sem nenhum consumo prévio, nem parcial — não existe
query nem página de financiamento hoje. `reference/paginas.md` não lista
essa tela no inventário atual (Visão geral, Rede e CNES, Atenção Primária,
Produção, Alertas, Comparador, Relatório IA).

- Decisão de produto: página nova + item de sidebar "Financiamento" (não
  seção dentro de tela existente). Como não há mockup específico em
  `reference/`, validar o layout contra `reference/design-system.md` antes
  de construir — mesmo padrão já usado quando "rodada de design foi pulada
  por decisão explícita" em Rede e CNES/Atenção Primária/Produção
  (registrado em `notes/backlog.md`).
- Nova `lib/queries/financiamento.ts`, novo tipo, nova rota
  `app/municipios/[municipioId]/financiamento/page.tsx`, novo item em
  `components/layout/app-sidebar.tsx`.
- Cuidado de proveniência: `mart_financiamento_saude_uniao` já normaliza o
  sinal do `valor` (FNS reporta débito com valor sempre positivo + flag
  separada; Portal da Transparência já usa sinal negativo para
  estorno/devolução) — não resomar as fontes sem essa normalização, ela já
  vem pronta da mart.
- `mart_financiamento_saude_siops` e `mart_repasses_fns` existem desde
  antes desta leva de marts mas também não têm consumo no frontend hoje —
  bom momento para trazer as 3 juntas nesta fase, já que cobrem a mesma
  pergunta de produto ("de onde vem o dinheiro da saúde do município").

## Fase 9 — Qualidade de dados: contagem exata da fonte SIA ✅ concluída em 2026-07-13

`app/qualidade-dados` usa `pg_class.reltuples` (estimativa) para o total de
registros da fonte SIA. Com `mart_producao_grupo_municipio` existindo
(desde a Fase 0), dá para trocar por `sum(quantidade_registros)` exato, sem
esperar `ANALYZE` do Postgres — já documentado como efeito colateral em
`notes/backlog.md`. Ajuste pequeno e isolado em
`lib/queries/qualidade-dados.ts`; pode ser feito a qualquer momento, baixa
prioridade.

## Critério de ordenação

Fase 0 é bug, feita primeiro independentemente de tudo. Fase 1 (Alertas) é
o ganho de maior visibilidade — uma página inteira hoje não mostra nada.
Fase 2 é a de menor esforço (3 colunas, UI já existe). Fases 3–6 adicionam
KPIs/seções novas a páginas que já existem, esforço moderado. Fase 7 é
redesenho de UX. Fase 8 é página nova, exige decisão de produto já tomada
aqui (ver acima) mas ainda sem mockup. Fase 9 é opcional, baixa prioridade,
pode ser feita em paralelo a qualquer outra fase.
