# Design system — RadarSUS Municipal

Extraído de `reference/Radar SUS.dc.html` (protótipo "Radar SUS", opção 1a —
identidade visual). Este documento é a referência primária de estilo daqui em
diante. Só reabra o HTML bruto se precisar conferir um detalhe que não esteja
aqui (ele é pesado e difícil de ler — foi gerado por uma ferramenta de design,
não é código de produção).

Se a paleta, tipografia ou componentes mudarem no protótipo original, atualize
este arquivo junto.

## Marca

- Nome: **RadarSUS Municipal**. Wordmark "Radar" + "SUS" (SUS em cor de
  destaque), subtítulo "MUNICIPAL" em mono, letter-spacing largo.
- Logo adotado nos mockups (landing, sidebar): variação de anéis de radar
  concêntricos com um ponto de eco — 2 anéis (raios ~25 e ~14) + um círculo
  menor deslocado (ponto de "eco/sinal"). Em fundo claro os anéis usam azul
  institucional/azul dados; em fundo escuro (sidebar) o anel externo vira
  ciano para manter contraste.
- Havia 2 outras propostas de logo no protótipo (cruz de saúde sob vigilância;
  varredura de radar com linha diagonal) — **descartadas**, mantidas só como
  histórico em `Radar SUS.dc.html` caso a direção mude.
- Cor do texto "Radar": azul institucional `#0B4F8A` em fundo claro, branco em
  fundo escuro. Cor do texto "SUS": sempre ciano `#22B8CF`.
- Fonte do wordmark: Space Grotesk 700. Subtítulo "MUNICIPAL": IBM Plex Mono,
  9–11px, letter-spacing ~0.14em, cor de apoio ou ciano dependendo do fundo.

## Paleta de cores

| Token sugerido | Hex | Uso |
|---|---|---|
| `brand-primary` | `#0B4F8A` | Azul institucional. Botões primários, ícones, texto de marca, links de ação. |
| `brand-secondary` | `#1A7FC4` | Azul de dados. Barras de gráfico, kickers de seção, destaque de valor "próprio" em comparações. |
| `brand-accent` | `#22B8CF` | Ciano de destaque. Indicador de item ativo (sidebar), linha de média em gráfico, pontos de status "atualizado". |
| `success` | `#1B9E4B` | Meta atingida / variação positiva. |
| `warning` | `#E6A817` | Atenção / variação neutra-negativa. |
| `danger` | `#D64545` | Crítico / variação negativa relevante. |
| `text-primary` | `#16202B` | Texto principal, títulos, valores. |
| `text-secondary` | `#5A6B7C` | Texto de apoio, subtítulos, labels. |
| `text-tertiary` | `#8A99A8` (rgb 138,153,168) | Labels de eixo, timestamps, placeholders, rodapés de fonte de dados. Não estava na paleta oficial do protótipo, mas é usado com frequência — vale formalizar como token. |
| `border` | `#E2E8EF` | Bordas padrão de cards, inputs, divisores. |
| `border-hairline` | `#F4F7F0`→`#F4F7FA` (rgb 244,247,250) | Divisores muito sutis dentro de tabelas (linhas de tabela). |
| `surface` | `#F4F7FA` | Fundo da área de conteúdo, blocos internos de destaque dentro de cards. |
| `surface-card` | `#FFFFFF` | Cartões e superfícies elevadas. |
| `surface-dark` | `#0A2E4F` | Sidebar e seções institucionais escuras (ex.: bloco "como funciona" da landing). |

### Variantes de status (badge/pill)

Cada status usa fundo bem claro (tint ~8–10%) + texto na cor escura da mesma
família, nunca a cor pura como texto (contraste):

| Status | Fundo | Texto | Dot |
|---|---|---|---|
| Meta ok / sucesso | `#E8F6EC` | `#1B9E4B` | `#1B9E4B` |
| Atenção | `#FDF3DC` | `#A3770A` (não `#E6A817` puro — contraste) | `#E6A817` |
| Crítico | `#FBE9E9` | `#D64545` | `#D64545` |

Alertas em lista/card usam a mesma lógica, mas com borda tintada em vez de pill:
crítico = borda `#F3D9D9` + fundo `#FDF7F7`; atenção = borda `#F3E7C6` + fundo
`#FDFAF1`.

## Tipografia

Três famílias, cada uma com um papel fixo — não usar Space Grotesk para corpo
de texto nem IBM Plex Sans para números de destaque:

- **Space Grotesk** (600/700) — títulos de página, títulos de seção grandes,
  todo número/KPI de destaque (`font-variant: tabular-nums`), valores em
  tabela quando precisam chamar atenção.
- **IBM Plex Sans** (400/500/600) — corpo de texto, botões, badges, texto de
  tabela, subtítulos.
- **IBM Plex Mono** (500/600) — labels técnicos em caixa alta com
  letter-spacing (kickers tipo "COBERTURA APS"), cabeçalhos de coluna de
  tabela, timestamps, rodapé de fonte de dados, badges tipo "RECOMENDADO".

### Escala de tamanho (aproximada, por uso)

| Tamanho | Uso |
|---|---|
| 9–10px | Micro-labels mono (kicker de card pequeno, cabeçalho de coluna, timestamp) |
| 10.5–11px | Kicker padrão, texto de badge, texto auxiliar pequeno |
| 12–13px | Corpo padrão, células de tabela |
| 14–15px | Título de card / seção dentro de dashboard |
| 17px | Título de destaque (nome de marca, card de diagnóstico) |
| 20–27px | Números de KPI dentro de card |
| 24–28px | Título de página |
| 34–42px | Números/headline de destaque em contexto de marketing (não usado nos dashboards internos) |

## Espaçamento e raios

- Padding de card padrão: 16–24px (KPI card ~16px, card de conteúdo maior
  ~20px).
- Padding de área de conteúdo (fora da sidebar): 26px 30px.
- Padding de sidebar: 22px 14px.
- Gaps entre blocos: 8px (itens dentro de um card) → 14–20px (entre cards de
  uma grade) → 24–32px (entre seções grandes, só em contexto de marketing).
- Border-radius: 4–6px (tags pequenas, barra de progresso interna),
  8–10px (botões, inputs, chips), 10–12px (cards padrão), 14px (card
  hero/destaque), 999px (pills e badges arredondados).

## Sombra

Regra importante: **cards padrão do dashboard não têm box-shadow, só
`border: 1px solid #E2E8EF`.** Sombra (`0 18px 40px rgba(11,79,138,.12)`)
aparece só em elementos hero/elevados de marketing (ex.: card de diagnóstico
da landing). Não aplicar sombra em cards de KPI, tabela ou lista — mantém a
estética "flat" institucional.

## Componentes-base

- **Botão primário**: fundo `brand-primary`, texto branco 600, padding
  ~10px 20px (maior em CTAs de destaque: 13–14px 24px), radius 8–10px.
- **Botão secundário (outline)**: fundo branco, borda 1.5px `brand-primary`,
  texto `brand-primary`, mesmo peso/padding do primário.
- **Badge de status**: dot 6–8px + texto, pill radius 999px, padding
  ~4–6px 10–12px. Ver tabela de status acima.
- **KPI card**: fundo branco, borda `border`, radius 12px, padding 16px;
  kicker mono 10px maiúsculo cor `text-secondary`; valor Space Grotesk 700
  20–27px cor `text-primary`; linha de contexto 11px colorida por semântica
  (verde `▲` positivo, vermelho/amarelo `▼` negativo, cinza neutro).
- **Chip de seleção** (ex.: seletor de municípios no comparador): pill branco
  com borda quando não selecionado; pill azul sólido (`brand-primary`) com
  texto branco quando selecionado, valor auxiliar em mono opacity 75%; chip
  tracejado (`border: 1px dashed`) para ação "+ adicionar".
- **Tabela de indicadores**: cabeçalho mono maiúsculo `text-tertiary`,
  divisor inferior sutil, linhas com padding 9–10px, valor em Space Grotesk
  600–700 13px, badge de status alinhado à direita.
- **Barra de progresso / ranking**: trilho `#EEF2F6` radius 99px (altura
  7px em "rede instalada", 16px em comparações lado a lado), preenchimento
  colorido por hierarquia (azul institucional para o item principal, tons
  mais claros/cinza para os demais).
- **Lista de alertas**: item com dot 8px alinhado ao topo do texto, fundo e
  borda tintados por severidade, título 12px 600, descrição 11px
  `text-secondary`.
- **Gráfico de barras mensal** (mapear para Recharts): barra padrão
  `brand-secondary` (#1A7FC4), barra de anomalia/destaque `warning`
  (#E6A817), linha tracejada de média em `brand-accent` (#22B8CF), rótulos de
  eixo X em mono 10px `text-tertiary`, anotação textual abaixo do gráfico em
  bloco cinza claro (`surface`) explicando o desvio.
- **Sidebar**: largura fixa ~236–240px, fundo `surface-dark`; logo no topo;
  item de navegação ativo = fundo ciano a 16% de opacidade + borda esquerda
  3px ciano + texto branco 600; inativo = texto branco a 62% de opacidade,
  sem fundo; badge de contagem (ex. alertas) = pill vermelho sólido;
  bloco inferior fixo (`margin-top: auto`) com card "última atualização" e
  perfil do usuário (avatar circular com iniciais + nome + unidade/órgão).
- **Header de página**: kicker mono à esquerda, título Space Grotesk 700
  24px + subtítulo `text-secondary` alinhado na base (baseline) ao lado;
  controles à direita = selects (borda 1px `#CDD8E3`, radius 8px, padding
  9px 14px) + botão primário de ação executiva.
- **Rodapé de fonte de dados**: texto mono 10.5px `text-tertiary`, centralizado,
  citando as fontes (ex.: "FONTES: CNES · SISAB · TABNET/DATASUS · IBGE") e,
  quando aplicável, aviso de dado simulado. Isso corresponde à seção
  "Documentação analítica" do `CLAUDE.md` — toda tela de indicador deve deixar
  a fonte e o período visíveis, mesmo que de forma discreta.

## Regras de aplicação no código

- Os tokens de cor acima devem virar variáveis de tema (Tailwind
  `theme.extend.colors` ou CSS variables consumidas pelo shadcn/ui), não
  hex espalhado pelos componentes.
- Componentes de dashboard (`components/cards`, `components/charts`,
  `components/alerts`, `components/tables`) devem seguir exatamente estes
  paddings/radius/tipografia — não criar variação visual ad-hoc por tela.
- Badges de status devem ser um único componente reutilizável
  (ex. `components/ui/status-badge.tsx` ou wrapper em `components/alerts/`)
  parametrizado por `"sucesso" | "atencao" | "critico"`, não recriado por
  tela.
