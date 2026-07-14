# Backlog

Itens que dependem de decisão do usuário ou de outra rodada de design antes
de virarem tarefa de implementação. Ver `ROADMAP.md` para a sequência de
fases e `notes/roadmap-dados.md` para o roadmap de consumo das marts novas
entregues pelo `raio-x-engenharia` em 2026-07-12/13.

## Decisões resolvidas (por julgamento, ao implementar todas as fases)

- **Rede e CNES vs. Auditor CNES**: tratadas como a **mesma tela**
  (`app/municipios/[municipioId]/rede-cnes/page.tsx`) — não era uma
  pergunta que dependia do projeto de dados, só de nomenclatura de
  produto.
- **Critério de pareamento de municípios** (Comparador): implementado para
  os 92 municípios do RJ por população, porte de rede ou microrregião.

## Decisões pendentes

- **Landing comercial**: este repositório hospeda a landing pública
  (`reference/paginas.md`, mockup 1b) ou ela vive em outro projeto? Não
  faz parte do escopo de "dashboards municipais" do `CLAUDE.md`.
- **Relatório executivo com IA**: decidir arquitetura (server action
  síncrona, fila assíncrona, serviço externo) e formato de saída (PDF,
  apresentação) antes de iniciar a Fase 9 do `ROADMAP.md`. Hoje existe um
  placeholder informativo em `app/municipios/[municipioId]/relatorio/
  page.tsx` explicando a pendência, sem nenhuma geração real.

## Rodada de design pulada por decisão explícita

Rede e CNES, Atenção Primária, Produção e o placeholder de Relatório IA
foram construídos direto a partir de `reference/design-system.md` (Fase 7
do `ROADMAP.md`), sem nova rodada de mockup — o design system já estava
maduro o bastante para isso. `reference/paginas.md` ainda não foi
atualizado com o detalhamento de seções dessas telas; fazer isso quando
alguém for usar aquele arquivo como referência de design de novo.

## Propostas para o dbt (`raio-x-engenharia`) — atendidas em 2026-07-13

Todas as 6 propostas abaixo (registradas ao implementar a Fase 2) foram
endereçadas do lado do dbt/collectors. Nenhum nome de mart proposto aqui
foi seguido literalmente — o pipeline escolheu grãos/nomes próprios (ver
detalhe em cada item) — então as queries em `lib/queries/` precisam de
ajuste antes de consumir o dado novo; nenhuma foi alterada por este
commit. Ver `raio-x-engenharia/ROADMAP.md` ("Demandas de dados do
frontend") e `ROADMAP_DBT.md` (Etapas 9-16) para o detalhamento completo
de grão e decisões de agregação de cada mart.

- ✅ **Produção pré-agregada** — não veio como
  `mart_producao_ambulatorial_mensal_municipio` (nome já referenciado em
  `lib/queries/producao-ambulatorial.ts:75`, hoje uma tabela inexistente
  — a chamada cai no fallback de `getProducaoMensalOrEmpty`). O dbt criou
  `marts.mart_producao_grupo_municipio`
  (`id_municipio, competencia_date, codigo_grupo, descricao_grupo,
  quantidade_produzida, quantidade_aprovada, valor_produzido,
  valor_aprovado`), grão município × competência × **grupo SIGTAP** — um
  grão a mais que o pedido, mas que serve as duas telas do mesmo jeito:
  * Série mensal (hoje em `buscarProducaoMensal`): trocar a origem por
    `select competencia_date, sum(quantidade_aprovada) as quantidade_aprovada
    from marts.mart_producao_grupo_municipio where id_municipio = $1
    group by competencia_date` (nota: coluna é `competencia_date`, tipo
    `date`, não `competencia_arquivo` texto — `formatCompetencia` em
    `lib/formatters/competencia-format.ts` pode precisar de ajuste de
    tipo).
  * Produção por grupo (hoje em `buscarProducaoPorGrupo`, que ainda varre
    `fct_producao_ambulatorial` direto): trocar por
    `select codigo_grupo, descricao_grupo, quantidade_aprovada, valor_aprovado
    from marts.mart_producao_grupo_municipio where id_municipio = $1 and
    competencia_date = $2 order by valor_aprovado desc` — resolve também
    o item de nome legível do grupo abaixo (`descricao_grupo` já vem no
    join).
- ✅ **Metas oficiais do Previne Brasil** — `marts.mart_indicadores_aps`
  ganhou 3 colunas novas: `parametro_percentual`, `meta_percentual`
  (ambos de `seed_previne_brasil_meta`, extraídos das 7 notas técnicas
  SAPS/MS) e `status_meta` já calculado
  (`ok` / `atencao` / `critico`) — basta incluir as 3 no `select` de
  `lib/queries/indicadores-aps.ts`, sem precisar computar status no
  frontend.
- ⚠️ **População total do município** — não foi adicionada em
  `dim_municipio` (ela cobre o Brasil inteiro sem recorte de ano; população
  é anual, IBGE só publica pros municípios cobertos pelo MVP hoje — juntar
  as duas exigiria decidir o que fazer com o resto do Brasil). Está
  disponível em 2 lugares, dependendo do escopo:
  * `marts.mart_cobertura_aps_municipio` (`id_municipio,
    ano_referencia_populacao, populacao_estimada`) — os 92 municípios do RJ.
  * `marts.mart_comparacao_municipios_rj` (`id_municipio, nome_municipio,
    ano_referencia_populacao, populacao_estimada,
    quantidade_estabelecimentos_saude, estabelecimentos_por_10k_habitantes,
    municipio_referencia`) — os 92 municípios do RJ, com porte de rede
    junto; é essa que dá pareamento de verdade (ver "Decisões resolvidas"
    acima sobre o Comparador).
  Continua sem população em `dim_municipio` propriamente dita — se algum
  consumo precisar de população por município **sem** depender de uma
  mart de domínio específico, essa lacuna segue aberta.
- ✅ **Classificação ICSAP** — `marts.mart_icsap_municipio`
  (`id_municipio, ano, total_internacoes, total_internacoes_icsap,
  percentual_icsap`), grão município de residência × ano. Denominador é o
  total de internações (não só "internações clínicas" da metodologia
  oficial completa) — ver comentário no `.sql` do mart antes de expor o
  percentual sem essa nota.
- ✅ **Observação sobre snapshot único do CNES** — deixou de ser
  snapshot único: `raw_cnes.estabelecimentos` agora carrega os 12 meses de
  2025 (chave composta `codigo_cnes` + `competencia`), e
  `marts.mart_historico_rede_cnes` (`id_estabelecimento_competencia,
  codigo_cnes, id_municipio, primeira_competencia_observada,
  ultima_competencia_observada, situacao_operacional`) classifica cada
  estabelecimento em `ativo` / `possivelmente_encerrado` / `historico` —
  dá pra reconstruir o alerta "N unidades sem atualização" filtrando
  `situacao_operacional = 'possivelmente_encerrado'` por município,
  exatamente o que a observação original dizia não ser possível.
  `marts.dim_estabelecimento` continua sendo o snapshot mais recente (1
  linha por estabelecimento, contrato preservado), agora também enriquecido
  com nome/endereço/geolocalização/esfera administrativa do DEMAS
  (`nome_fantasia`, `endereco`, `bairro`, `latitude`, `longitude`,
  `descricao_esfera_administrativa`, `descricao_turno_atendimento`,
  `possui_centro_cirurgico/obstetrico/neonatal`, `possui_atendimento_hospitalar`
  — todas nullable, nem todo estabelecimento está no cadastro do DEMAS).
- ⚠️ **Nome legível de código SIGTAP** — feito só em nível de **grupo**
  (2 primeiros dígitos, 9 grupos — `seed_sigtap_grupo`, já embutido em
  `mart_producao_grupo_municipio.descricao_grupo` acima). Nome legível por
  **procedimento** completo (10 dígitos) não foi feito — seria um seed de
  milhares de códigos, escopo bem maior; "Grupo 02 (SIGTAP)" já vira algo
  como "Procedimentos com finalidade diagnóstica", mas o procedimento
  individual continua só como código.

Efeito colateral pra `app/qualidade-dados`: com
`mart_producao_grupo_municipio` existindo, o total de registros da SIA por
município pode ser `sum(quantidade_registros)` da mart em vez da
estimativa `pg_class.reltuples` — rápido e exato, sem esperar o `ANALYZE`
do Postgres.
