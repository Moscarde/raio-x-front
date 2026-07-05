# Inventário de páginas — RadarSUS Municipal

Extraído de `reference/Radar SUS.dc.html` (protótipo "Radar SUS"). Objetivo:
mapear cada tela do protótipo para uma rota real do projeto, evitando reabrir
o HTML sempre que for criar ou revisar uma página. Padrões visuais detalhados
(cores, tipografia, componentes) estão em `reference/design-system.md` — este
documento foca em **o que cada página mostra e para quem**.

Legenda de status:
- ✅ **Protótipo pronto** — existe mockup detalhado no HTML de referência.
- 🕳️ **Pendente de design** — citada na navegação/módulos do protótipo, mas
  sem mockup ainda. Precisa de uma rodada de design antes de virar página.

## ✅ Dashboard — Visão geral (Raio-X Municipal)

- **Rota sugerida**: `app/municipios/[municipioId]/page.tsx`
- **Objetivo**: fotografia executiva de um município — estrutura de rede,
  produção, cobertura APS e alertas — sem precisar consultar vários sistemas.
- **Usuário**: gestor/secretário municipal de saúde, analista da SMS.
- **Seções (de cima para baixo)**:
  1. Header: kicker "RAIO-X MUNICIPAL", nome do município + UF/região/
     população, seletor de município, seletor de período, CTA "Gerar relatório
     executivo".
  2. Faixa de 5 KPI cards: cobertura APS, equipes ESF (completas/incompletas),
     unidades CNES (com alerta de desatualização), produção ambulatorial/mês,
     internações ICSAP (% do total).
  3. Grid 1.5fr/1fr: gráfico de produção ambulatorial (12 meses, barra +
     linha de média + anotação de anomalia) ao lado da lista de alertas
     priorizados (top 4, com link "Ver todos").
  4. Grid 1fr/1.5fr: "Rede instalada" (barras de contagem por tipo de
     unidade: UBS, consultórios/clínicas, SADT, urgência, hospital) ao lado
     da tabela de indicadores APS (Previne Brasil: resultado, meta, status).
  5. Rodapé com fonte dos dados e aviso de atualização.
- **Componentes envolvidos**: `kpi-card`, `producao-mensal-chart`,
  `alert-list`, `rede-instalada-bars`, `indicadores-aps-table`,
  `municipio-select`, `periodo-select`.
- **Dados necessários** (a validar no dbt/Postgres — nomes abaixo são
  descritivos, não literais): resumo do município (cobertura APS, equipes,
  unidades, produção, ICSAP), série mensal de produção ambulatorial,
  alertas priorizados, contagem de unidades por tipo, indicadores Previne
  Brasil do quadrimestre com meta e status.

## ✅ Dashboard — Comparador de municípios semelhantes

- **Rota sugerida**: `app/comparador/page.tsx` (ou
  `app/municipios/[municipioId]/comparador/page.tsx`, a decidir conforme o
  fluxo de navegação real)
- **Objetivo**: comparar o município com pares (mesma faixa populacional,
  região, porte de rede), mostrando posição relativa e pontos fortes/fracos.
- **Usuário**: mesmo gestor, em contexto de benchmarking/justificativa de
  investimento.
- **Seções**:
  1. Header: kicker "COMPARADOR DE MUNICÍPIOS", título "X vs. pares" +
     critério de pareamento como subtítulo, controle de critério de
     pareamento, CTA "Exportar comparação".
  2. Chips de município selecionado (com população) + municípios
     comparados + ação "+ Adicionar município".
  3. 3 KPI cards de destaque: posição geral entre pares (ranking), ponto
     forte (verde), ponto de atenção (vermelho).
  4. Tabela "Indicadores lado a lado": uma coluna por município (a do
     município principal destacada), última coluna com badge de posição/
     ranking por linha.
  5. Grid 1fr/1fr: dois gráficos de barras horizontais comparando um
     indicador específico entre municípios (ex.: cobertura APS, produção
     per capita), com o município principal destacado em cor sólida
     (verde/vermelho conforme posição) e os demais em tom neutro; anotação
     textual de hipótese abaixo quando houver um outlier.
  6. Rodapé com fonte dos dados.
- **Componentes envolvidos**: `kpi-card` (variante ranking/destaque),
  componente novo de chip de seleção de município (não existe ainda em
  `components/filters/` — avaliar `components/filters/municipio-select.tsx`
  vs. um novo `municipio-chip-select.tsx`), tabela comparativa (variante de
  `indicadores-aps-table` ou tabela própria), gráfico de barra horizontal
  comparativo (novo componente em `components/charts/`).
- **Dados necessários**: lista de municípios pares por critério
  (população/região/porte), indicadores lado a lado para o conjunto
  selecionado, ranking por indicador, texto de insight/hipótese (se gerado
  por regra de negócio ou por IA, decidir onde essa lógica mora — não deve
  ser calculada solta no componente React).

## 🕳️ Rede e CNES

- **Rota sugerida**: `app/municipios/[municipioId]/rede-cnes/page.tsx`
- **Citada em**: item de navegação da sidebar; módulo "Auditor CNES" na
  landing ("unidades desatualizadas, vínculos inconsistentes e serviços sem
  produção — antes de virarem perda de recurso").
- **Objetivo provável**: detalhar a rede física (unidades, leitos,
  profissionais) e auditar qualidade/atualização do CNES por unidade.
- **Status**: sem mockup. Antes de desenhar, confirmar com o usuário se
  "Rede e CNES" e "Auditor CNES" são a mesma tela ou duas telas distintas.

## 🕳️ Atenção Primária (Radar APS)

- **Rota sugerida**: `app/municipios/[municipioId]/atencao-primaria/page.tsx`
- **Citada em**: item de navegação da sidebar; módulo "Radar APS" na landing
  ("indicadores por equipe, unidade e quadrimestre, com alertas de meta e
  necessidade de busca ativa"); link "Abrir Radar APS" na tabela de
  indicadores APS da visão geral.
- **Objetivo provável**: versão detalhada/navegável da tabela de indicadores
  Previne Brasil que hoje aparece resumida na visão geral — provavelmente
  com quebra por equipe/unidade, não só por município.
- **Status**: sem mockup. A tabela resumida da visão geral (ver seção acima)
  é o melhor ponto de partida visual para esta tela.

## 🕳️ Produção

- **Rota sugerida**: `app/municipios/[municipioId]/producao/page.tsx`
- **Citada em**: item de navegação da sidebar.
- **Objetivo provável**: detalhamento da produção ambulatorial (o gráfico
  resumido já existe na visão geral) — possivelmente por unidade, por tipo
  de procedimento, ou com granularidade maior de tempo.
- **Status**: sem mockup.

## 🕳️ Alertas

- **Rota sugerida**: `app/municipios/[municipioId]/alertas/page.tsx`
- **Citada em**: item de navegação da sidebar com badge de contagem; link
  "Ver todos (6)" na visão geral.
- **Objetivo provável**: lista completa e filtrável dos alertas priorizados
  (o padrão visual do item de alerta já está definido — ver
  `design-system.md`, seção "Lista de alertas").
- **Status**: sem mockup de tela cheia, mas o componente de item de alerta
  já está validado visualmente na visão geral.

## 🕳️ Relatório IA

- **Rota sugerida**: `app/municipios/[municipioId]/relatorio/page.tsx`
- **Citada em**: item de navegação da sidebar; módulo "Relatório Executivo
  com IA" na landing ("análises interpretadas, variações explicadas e pauta
  de reunião pronta — em PDF e apresentação"); CTA "Gerar relatório
  executivo" no header da visão geral.
- **Objetivo provável**: geração/visualização de relatório executivo
  (possivelmente exportável em PDF) com narrativa gerada a partir dos
  indicadores. Envolve decisão de arquitetura (server action vs. serviço
  externo de IA) fora do escopo deste documento visual.
- **Status**: sem mockup.

## 🏷️ Identidade visual (não é uma página)

- Opção 1a do protótipo é a fonte da paleta, tipografia e componentes-base —
  já extraída integralmente em `reference/design-system.md`. Não precisa
  virar rota; serve só como referência de design system.

## 🏷️ Landing comercial (opcional, fora do escopo atual do dashboard interno)

- **Rota sugerida, se for construída**: `app/(marketing)/page.tsx` ou
  domínio/projeto separado — a decidir, já que o `CLAUDE.md` descreve este
  repositório como camada de aplicação/apresentação para gestores, não
  necessariamente como site comercial público.
- **Conteúdo do mockup**: header com nav + CTA, hero com card de
  "diagnóstico automático" (mini preview do dashboard), seção de módulos
  (6 cards: Raio-X Municipal, Auditor CNES, Radar APS, Comparador de
  Municípios, Alertas de Inconsistência, Relatório Executivo com IA), seção
  "como funciona" (3 passos, fundo navy escuro), seção de planos (4 cards:
  Diagnóstico, Monitoramento Mensal — recomendado, Plataforma Municipal,
  Relatórios como Serviço), CTA final.
- **Status**: mockup completo (opção 1b), mas decisão de construir ou não
  esta página fica pendente — não é um dashboard municipal nem uma página de
  documentação/qualidade previstas no `CLAUDE.md`. Tratar como backlog em
  `notes/backlog.md` se for adiante.

## Navegação global (sidebar)

Ordem confirmada no protótipo, usada em todas as telas de dashboard:

1. Visão geral
2. Rede e CNES
3. Atenção Primária
4. Produção
5. Alertas (com badge de contagem)
6. Comparador
7. Relatório IA

Rodapé fixo da sidebar: card "última atualização" (por fonte, ex. "CNES · jun
2026", "SISAB · Q1 2026") + perfil do usuário (avatar + nome + órgão). Ver
`design-system.md` para o padrão visual exato.
