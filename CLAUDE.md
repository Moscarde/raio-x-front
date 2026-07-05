# CLAUDE.md

Este projeto é uma aplicação web analítica construída com Next.js.

O objetivo é criar dashboards, páginas executivas e documentação visual para dados municipais de saúde, consumindo o PostgreSQL alimentado pelo projeto principal de engenharia de dados.

A aplicação deve seguir uma estética de produto SaaS/dashboard, com alto controle visual, componentes reutilizáveis, boa performance e código fácil de evoluir com IA.

## Stack

* Next.js com App Router.
* TypeScript.
* Tailwind CSS.
* shadcn/ui.
* Recharts para gráficos.
* PostgreSQL como fonte de dados.
* dbt no projeto principal para modelagem e regras de negócio.
* Git como fonte da verdade.

## Projeto principal de dados

O projeto principal fica em:

```txt
/home/moscarde/raio-x-engenharia
```

Ele contém:

* ingestão;
* Airflow;
* dbt;
* models;
* seeds;
* snapshots;
* documentação técnica;
* regras de transformação;
* camadas raw, staging, intermediate e gold/marts.

Este repositório deve ser tratado como **camada de aplicação e apresentação**.

Não duplicar aqui lógica pesada de transformação que deveria viver no dbt.

## Referências visuais

A pasta abaixo contém imagens, HTMLs e referências criadas pelo Claude Design:

```txt
reference/
```

Antes de criar ou alterar telas relevantes, consulte os arquivos em `reference/`.

Os padrões visuais e o inventário de páginas já foram extraídos para:

```txt
reference/design-system.md
reference/paginas.md
```

Consulte esses dois arquivos primeiro. Só abra `reference/Radar SUS.dc.html`
diretamente se precisar conferir um detalhe que não esteja documentado ali —
o arquivo é pesado e gerado por ferramenta de design, não é código de
produção.

Use essas referências para manter consistência em:

* layout;
* espaçamento;
* cores;
* hierarquia visual;
* tipografia;
* formato dos cards;
* sidebar;
* headers;
* botões;
* tabelas;
* gráficos;
* badges;
* alertas;
* estados visuais.

Não copie cegamente HTML de referência se isso piorar a arquitetura React. Use como direção visual e recrie com componentes limpos.

## Papel deste projeto

Este projeto deve conter:

* dashboards municipais;
* páginas executivas;
* componentes visuais reutilizáveis;
* páginas de documentação;
* páginas de qualidade e cobertura dos dados;
* filtros e navegação;
* relatórios executivos;
* consultas leves ao banco;
* integração segura com PostgreSQL.

Este projeto não deve conter:

* collectors;
* DAGs;
* jobs de ingestão;
* transformações pesadas;
* regras centrais de negócio duplicadas;
* SQL analítico muito complexo;
* dados sensíveis versionados;
* dumps de banco;
* arquivos grandes de dados.

## Princípios gerais

* Priorize clareza, consistência visual e manutenção.
* Trate cada tela como produto, não como gráfico solto.
* Componentes devem ser pequenos e reutilizáveis.
* Queries devem ser isoladas da UI.
* Tipos devem ser explícitos.
* Dados exibidos devem vir preferencialmente de views/tabelas analíticas do dbt.
* O frontend não deve conhecer detalhes das camadas raw.
* Não inventar schemas, tabelas ou colunas.
* Validar dados pelo PostgreSQL ou pelos models dbt quando houver dúvida.
* Evitar abstrações prematuras.
* O projeto deve ser apresentável como portfólio e possível produto real.

## Contextualização dos dados

Para entender os dados disponíveis, é permitido consultar:

1. O banco PostgreSQL usado pelo projeto.
2. Os models dbt do projeto principal em:

```txt
/home/moscarde/raio-x-engenharia
```

Quando necessário, consultar:

```txt
/home/moscarde/raio-x-engenharia/models/
/home/moscarde/raio-x-engenharia/dbt_project.yml
/home/moscarde/raio-x-engenharia/README.md
/home/moscarde/raio-x-engenharia/ROADMAP.md
```

Antes de criar uma nova tela, card, gráfico ou tabela, verificar se já existe model, view ou documentação adequada no projeto principal.

## Arquitetura esperada

Estrutura recomendada:

```txt
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── municipios/
│   │   └── [municipioId]/
│   │       └── page.tsx
│   ├── documentacao/
│   │   └── page.tsx
│   └── api/
├── components/
│   ├── layout/
│   ├── cards/
│   ├── charts/
│   ├── tables/
│   ├── alerts/
│   ├── filters/
│   └── ui/
├── lib/
│   ├── db/
│   ├── queries/
│   ├── formatters/
│   ├── validators/
│   └── utils/
├── types/
├── tests/
├── reference/
├── notes/
└── public/
```

Use essa estrutura como guia. Não criar pastas novas sem necessidade clara.

## Separação de responsabilidades

A UI não deve consultar o banco diretamente.

Fluxo recomendado:

```txt
PostgreSQL/dbt
  ↓
lib/db
  ↓
lib/queries
  ↓
server component / route handler / server action
  ↓
componentes visuais
```

Responsabilidades:

```txt
app/          rotas, layouts e composição de páginas
components/   componentes visuais reutilizáveis
lib/db/       conexão com banco
lib/queries/  consultas SQL e funções de leitura
lib/formatters/ formatação de números, datas e percentuais
lib/validators/ validação de entrada e schemas
types/        tipos compartilhados
reference/    referências visuais
notes/        backlog e decisões
```

## Camadas de dados

Ordem de preferência para consultas:

1. Schemas específicos para dashboard:

   * `gold_dashboard`
   * `marts_dashboard`
   * `analytics`

2. Camadas finais de negócio:

   * `gold`
   * `marts`

3. Camadas intermediárias, apenas quando necessário.

4. Camadas raw, apenas para auditoria, debug ou qualidade.

Evite usar raw em telas finais.

## SQL

* Use SQL explícito.
* Evite `select *`.
* Nomeie colunas pensando no uso da interface.
* Use aliases claros.
* Mantenha queries pequenas.
* Evite joins pesados no Next.js.
* Evite agregações complexas em tempo de request.
* Prefira dados pré-agregados no dbt.
* Sempre ordene resultados quando a ordem importar.
* Use `limit` em listagens exploratórias.
* Não duplique SQL entre arquivos.

Se uma query passar de aproximadamente 60 linhas, avaliar se ela deveria virar model/view no dbt.

Exemplo bom:

```sql
select
    municipio_id,
    municipio_nome,
    cobertura_aps_percentual,
    equipes_esf_total,
    unidades_cnes_total,
    producao_ambulatorial_mes,
    internacoes_icsap_percentual
from gold_dashboard.vw_municipio_resumo
where municipio_id = $1
```

Exemplo ruim:

```sql
select *
from raw_ibge.municipios m
join raw_cnes.estabelecimentos e on ...
join raw_datasus.producao p on ...
```

## Acesso ao banco

* Centralizar conexão em `lib/db/`.
* Não criar conexão PostgreSQL espalhada em componentes.
* Não expor credenciais ao client.
* Toda consulta ao banco deve rodar no servidor.
* Não usar variável de ambiente pública para senha ou host privado.
* Não colocar connection string em arquivo versionado.

Variáveis públicas devem começar com `NEXT_PUBLIC_` apenas quando forem realmente seguras para o navegador.

Credenciais de banco nunca devem usar `NEXT_PUBLIC_`.

## Componentes de layout

Componentes esperados:

```txt
components/layout/app-sidebar.tsx
components/layout/dashboard-header.tsx
components/layout/page-shell.tsx
components/layout/content-grid.tsx
```

O layout deve suportar:

* sidebar fixa ou colapsável;
* item ativo;
* badge de alertas;
* header com título e subtítulo;
* filtros globais;
* botão de ação executiva;
* grid responsivo.

## Componentes de dashboard

Componentes esperados:

```txt
components/cards/kpi-card.tsx
components/charts/producao-mensal-chart.tsx
components/alerts/alert-card.tsx
components/alerts/alert-list.tsx
components/charts/rede-instalada-bars.tsx
components/tables/indicadores-aps-table.tsx
components/filters/municipio-select.tsx
components/filters/periodo-select.tsx
```

Componentes devem:

* receber props explícitas;
* não acessar banco diretamente;
* não conter regra de negócio pesada;
* não fazer fetch client-side sem necessidade;
* ser fáceis de testar;
* preservar consistência visual com `reference/`.

## shadcn/ui

Usar shadcn/ui como base para:

* Card;
* Button;
* Select;
* Badge;
* Table;
* DropdownMenu;
* Tabs;
* Skeleton;
* Tooltip;
* Dialog;
* Sheet.

Não editar componentes base em `components/ui/` sem necessidade clara.

Quando precisar de variação visual específica, preferir criar wrapper fora de `components/ui/`.

Exemplo:

```txt
components/cards/kpi-card.tsx
```

em vez de alterar diretamente:

```txt
components/ui/card.tsx
```

## Recharts

Usar Recharts para gráficos.

Regras:

* Componentes de gráfico devem ficar em `components/charts/`.
* Dados devem chegar já prontos para plotagem.
* Evitar transformar grandes datasets dentro do componente.
* Definir props tipadas.
* Tratar estado vazio.
* Tratar loading quando aplicável.
* Manter tooltips legíveis.
* Evitar gráficos com informação demais.

Exemplo de tipo:

```ts
export type ProducaoMensalPoint = {
  competenciaLabel: string
  realizado: number
  media12m: number
  isDestaque?: boolean
}
```

## Design system

Seguir visual inspirado nas referências em `reference/`.

Direção visual:

* aparência institucional e moderna;
* fundo claro;
* cards brancos;
* bordas suaves;
* sombras discretas;
* azul como cor principal;
* cores de status bem definidas;
* tipografia limpa;
* bastante espaçamento;
* hierarquia clara.

Evitar:

* excesso de cores;
* gráficos poluídos;
* cards sem alinhamento;
* variações visuais aleatórias;
* componentes com estilos duplicados;
* telas com densidade excessiva.

## Estados da interface

Toda área importante deve prever:

* loading;
* estado vazio;
* erro;
* dados indisponíveis;
* alerta de atualização;
* valores nulos.

Não mostrar `undefined`, `NaN`, `null` ou erro cru na interface.

Exemplo:

```txt
Dados ainda não disponíveis para este município no período selecionado.
```

## Formatação de valores

Centralizar formatação em `lib/formatters/`.

Exemplos:

```txt
lib/formatters/number-format.ts
lib/formatters/percent-format.ts
lib/formatters/date-format.ts
lib/formatters/competencia-format.ts
```

Não espalhar `toLocaleString`, concatenação de `%` ou formatação manual por vários componentes.

## TypeScript

* Tipos explícitos são obrigatórios.
* Não usar `any` sem justificativa forte.
* Evitar `unknown` sem refinamento.
* Preferir tipos nomeados para dados de domínio.
* Separar tipos compartilhados em `types/`.
* Tipos específicos de componente podem ficar no próprio arquivo.
* Não deixar funções exportadas sem tipo de retorno.

Exemplo bom:

```ts
export type MunicipioResumo = {
  municipioId: string
  municipioNome: string
  regiaoNome: string
  populacao: number
  coberturaApsPercentual: number
}

export async function getMunicipioResumo(
  municipioId: string,
): Promise<MunicipioResumo> {
  // ...
}
```

## Estilo de código

Para qualquer código TypeScript, JavaScript ou Python criado neste projeto:

* Funções devem ter entre 4 e 20 linhas sempre que possível.
* Se passar disso, dividir por responsabilidade.
* Arquivos devem ter menos de 500 linhas.
* Cada função deve fazer uma coisa.
* Cada módulo deve ter uma responsabilidade clara.
* Evite arquivos “god file”.
* Use nomes específicos e únicos.
* Evite nomes genéricos como `data`, `handler`, `manager`, `utils`, `helper`.
* Prefira nomes que retornem poucos resultados no grep do projeto.
* Use tipos explícitos.
* Não use `any`.
* Não use funções sem tipo em TypeScript.
* Não duplique código.
* Extraia lógica repetida para função, componente ou módulo.
* Prefira early return em vez de muitos `if` aninhados.
* Máximo de 2 níveis de indentação.
* Mensagens de erro devem incluir o valor problemático e o formato esperado.

Exemplo ruim:

```ts
function handle(data: any) {
  if (data) {
    if (data.value) {
      return data.value
    }
  }

  return null
}
```

Exemplo melhor:

```ts
type FonteStatus = {
  fonteNome: string
  totalRegistros: number
}

function getTotalRegistrosFonte(fonteStatus: FonteStatus): number {
  if (!fonteStatus.fonteNome) {
    throw new Error(
      `Fonte inválida: "${fonteStatus.fonteNome}". Esperado nome não vazio.`,
    )
  }

  return fonteStatus.totalRegistros
}
```

## React

* Preferir Server Components por padrão.
* Usar Client Components apenas quando houver interatividade real.
* Marcar `"use client"` apenas no menor componente possível.
* Não transformar página inteira em client component sem necessidade.
* Evitar estados globais antes de necessidade real.
* Passar dados por props quando simples.
* Usar URL/search params para filtros compartilháveis quando fizer sentido.
* Separar componentes de composição e componentes de apresentação.

Bom padrão:

```txt
app/municipios/[municipioId]/page.tsx
  busca dados no servidor
  compõe a página

components/charts/producao-mensal-chart.tsx
  recebe dados
  renderiza gráfico
```

## Server Components, Actions e API Routes

Preferência:

1. Server Components para carregar dados de página.
2. Server Actions para ações controladas.
3. Route Handlers em `app/api` quando houver necessidade de endpoint.
4. Client fetch apenas quando a interação exigir atualização no navegador.

Não criar API route apenas para uma página server-side consumir se a função pode ser chamada diretamente no servidor.

## Validação

Validar entradas externas:

* params de rota;
* search params;
* payloads de actions;
* filtros;
* IDs;
* períodos.

Preferir validação centralizada em `lib/validators/`.

Exemplo:

```ts
export function parseMunicipioId(value: string): string {
  if (!value.match(/^\d{6,7}$/)) {
    throw new Error(`municipioId inválido: "${value}". Esperado código IBGE.`)
  }

  return value
}
```

## Comentários

* Preserve comentários existentes em refactors.
* Comentários devem explicar o porquê, não o óbvio.
* Evite comentários que apenas repetem o código.
* Docstrings devem existir em funções públicas.
* Docstrings devem conter intenção e um exemplo curto de uso.
* Se uma linha existir por bug, limitação upstream ou decisão histórica, referenciar issue, commit ou contexto.

Exemplo ruim:

```ts
// soma 1 ao contador
counter += 1
```

Exemplo bom:

```ts
// O gráfico recebe a competência já formatada para preservar ordenação SQL
// e evitar divergência entre tooltip, eixo X e tabela.
const competenciaLabel = point.competenciaLabel
```

## Testes

Quando houver código auxiliar, ele deve ser testável.

Regras:

* Testes devem rodar com um único comando definido no README.
* Toda nova função relevante deve ter teste.
* Correção de bug deve incluir teste de regressão.
* Mock de I/O externo deve usar fake nomeado, não stub inline confuso.
* Não bater em banco real em teste unitário.
* Não depender de filesystem real quando for possível injetar fake.
* Testes devem ser F.I.R.S.T:

  * Fast;
  * Independent;
  * Repeatable;
  * Self-validating;
  * Timely.

Testar especialmente:

* formatadores;
* validadores;
* mapeamento de dados SQL para tipos da UI;
* componentes críticos;
* estados vazios;
* regressões de bugs.

## Dependências

* Evite dependências novas sem necessidade clara.
* Antes de adicionar pacote, justificar o motivo.
* Preferir recursos nativos do Next.js, React, shadcn/ui e Recharts.
* Injetar dependências por parâmetro, não por global escondido.
* Bibliotecas externas devem ser encapsuladas atrás de interface fina quando usadas em código relevante.
* Não espalhar chamadas diretas a bibliotecas externas por vários arquivos.

Exemplo:

```txt
lib/db/postgres.ts
lib/formatters/percent-format.ts
lib/validators/municipio-validator.ts
```

## Formatação

Usar o formatador padrão da stack.

* TypeScript/JavaScript: Prettier.
* Python, se existir: Black.
* SQL: indentação consistente e legível.
* Tailwind: classes organizadas de forma legível.
* Markdown: títulos e blocos bem estruturados.

Não discutir estilo manualmente quando o formatador resolver.

## Logging

Este projeto deve ter logging moderado.

Quando houver logs técnicos:

* usar JSON estruturado;
* não logar secrets;
* não logar connection strings;
* não logar dados sensíveis;
* não logar amostras identificáveis;
* incluir contexto suficiente para debug.

Exemplo:

```json
{
  "event": "municipio_dashboard_query_failed",
  "municipioId": "3303807",
  "queryName": "municipio_resumo",
  "error": "column cobertura_aps_percentual not found"
}
```

Mensagens user-facing podem ser texto simples e amigável.

## Performance

Regras:

* Evitar carregar datasets grandes no client.
* Evitar renderizar tabelas enormes.
* Paginar ou limitar listas grandes.
* Pré-agregar dados no dbt.
* Usar Server Components para reduzir JS no navegador.
* Usar Client Components apenas quando necessário.
* Evitar cálculos pesados dentro de componentes React.
* Usar cache com cuidado quando os dados permitirem.
* Pensar em índices no PostgreSQL para consultas frequentes.
* Evitar waterfalls de fetch quando os dados podem ser carregados juntos.

Se uma página estiver lenta, investigar nesta ordem:

1. Query SQL.
2. Falta de pré-agregação no dbt.
3. Falta de índice no PostgreSQL.
4. Excesso de dados enviados ao client.
5. Componentes client-side desnecessários.
6. Gráfico/tabela com granularidade inadequada.

## Segurança e dados sensíveis

Este projeto pode lidar com dados de saúde pública.

Regras obrigatórias:

* Não expor dados pessoais identificáveis.
* Não exibir CPF, CNS, endereço, telefone, nome de paciente ou dados individualizados sensíveis.
* Não criar páginas com granularidade individual de paciente.
* Preferir dados agregados.
* Não versionar secrets.
* Não versionar credenciais.
* Usar variáveis de ambiente para conexão.
* Não colocar strings reais de conexão em README, Markdown ou exemplos públicos.
* Não logar dados sensíveis.
* Não criar dumps locais versionados.
* Não enviar dados sensíveis para serviços externos sem decisão explícita.

## Documentação analítica

Toda página de indicador deve deixar claro, quando aplicável:

* o que o indicador mede;
* fonte original;
* granularidade;
* período de referência;
* regra de cálculo;
* filtros aplicados;
* limitações;
* data ou competência de atualização.

A documentação deve ser objetiva e compreensível para público técnico e gestor.

## Qualidade de dados

O projeto deve ter espaço para páginas ou componentes de qualidade.

Indicadores úteis:

* última atualização por fonte;
* total de registros por fonte;
* total de municípios cobertos;
* competências disponíveis;
* campos críticos nulos;
* duplicidades;
* fontes sem atualização recente;
* quebras de chave esperada.

Sempre que possível, essas métricas devem vir de models/views do dbt.

## Uso com IA

Ao modificar o projeto:

* Ler este arquivo antes de alterar.
* Consultar `reference/` antes de mexer em telas principais.
* Preservar a estrutura existente.
* Fazer mudanças pequenas e revisáveis.
* Não inventar schemas, tabelas ou colunas.
* Consultar banco ou dbt quando houver dúvida.
* Não criar múltiplos padrões para a mesma coisa.
* Não reescrever grandes partes sem necessidade.
* Explicar decisões estruturais relevantes.
* Não adicionar dependências sem justificar.
* Não criar abstrações antes de existir necessidade real.
* Preferir componentes pequenos e tipados.
* Não transformar tudo em client component.

Antes de implementar uma nova tela, verificar:

1. Qual pergunta a tela responde.
2. Qual usuário usaria essa tela.
3. Qual fonte/model será usado.
4. Se já existe tela ou componente parecido.
5. Se a lógica pertence ao frontend ou ao dbt.
6. Se há risco de expor dado sensível.
7. Se os dados já vêm prontos para visualização.
8. Se há componente shadcn/ui que resolve parte do caso.
9. Se qualquer código auxiliar criado é pequeno e testável.
10. Se o visual segue as referências em `reference/`.

## Quando propor mudança no dbt

Propor alteração no projeto principal quando:

* a query do frontend ficar longa demais;
* a mesma regra for usada em múltiplas telas;
* houver regra de negócio relevante;
* houver necessidade de teste de dados;
* houver join recorrente;
* houver cálculo de indicador oficial;
* houver problema de performance por falta de pré-agregação;
* houver necessidade de materialização ou índice.

Exemplo:

```txt
Sugestão: criar a view gold_dashboard.vw_municipio_resumo no projeto dbt.

Motivo: a tela inicial precisa dos mesmos KPIs em vários contextos,
e a lógica envolve regra de negócio reutilizável.
```


## Backlog

Ideias futuras e tarefas pendentes devem ficar em:

```txt
notes/backlog.md
```

Não criar arquivos incompletos espalhados pelo projeto.

## Critérios de aceite

Uma nova tela ou componente só deve ser considerado pronto se:

* renderiza sem erro;
* está tipado;
* usa dados da camada correta;
* não expõe dados sensíveis;
* trata loading, erro e estado vazio quando aplicável;
* segue a referência visual;
* não duplica lógica;
* não adiciona dependência sem necessidade;
* mantém componentes pequenos;
* mantém queries isoladas;
* tem teste quando há lógica relevante;
* não transforma código server em client sem necessidade.

## Regra final

Este projeto deve parecer um produto de dados bem cuidado.

Não é apenas um conjunto de gráficos.

Cada tela deve ajudar alguém a entender os dados, confiar na origem, interpretar os indicadores e tomar decisões.

A aplicação deve equilibrar visual profissional, performance, segurança e simplicidade de manutenção.
