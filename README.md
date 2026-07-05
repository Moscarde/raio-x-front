# RadarSUS Dashboards

Aplicação web analítica para visualização de indicadores municipais de saúde.

Este projeto consome dados do PostgreSQL alimentado pelo projeto principal de engenharia de dados e apresenta dashboards, relatórios executivos e páginas documentais com interface customizada.

## Stack

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts
* PostgreSQL
* dbt no projeto principal

## Relação com o projeto de dados

Este repositório é apenas a camada de aplicação e apresentação.

O projeto principal de engenharia de dados fica em:

```txt
/home/moscarde/raio-x-engenharia
```

Ele é responsável por:

* ingestão de dados;
* Airflow;
* dbt;
* transformação;
* testes;
* criação de views e tabelas analíticas;
* camadas raw, staging, intermediate e gold/marts.

Este projeto deve consumir preferencialmente views/tabelas analíticas já prontas, como:

```txt
gold_dashboard.*
marts_dashboard.*
analytics.*
gold.*
marts.*
```

Evite colocar regras pesadas de negócio ou transformação neste frontend.

## Objetivo

Criar uma interface no estilo produto SaaS/dashboard para apoiar leitura executiva dos dados municipais.

A aplicação deve permitir:

* visualizar resumo municipal;
* acompanhar indicadores principais;
* identificar alertas priorizados;
* consultar rede instalada;
* acompanhar produção mensal;
* visualizar indicadores APS;
* gerar ou preparar relatórios executivos;
* documentar metodologia e origem dos dados.

## Referências visuais

A pasta abaixo contém imagens, HTMLs e referências de design:

```txt
reference/
```

Antes de alterar telas principais, consulte essa pasta para manter consistência visual.

Os padrões visuais e o inventário de páginas já foram extraídos das
referências brutas para consulta rápida:

```txt
reference/design-system.md   cores, tipografia, espaçamento, componentes
reference/paginas.md         inventário de páginas (prontas e pendentes)
```

Prefira consultar esses dois arquivos antes de abrir `Radar SUS.dc.html`
diretamente — ele é pesado e serve só como fonte original caso falte algum
detalhe.

As referências devem orientar:

* sidebar;
* cards;
* gráficos;
* tabelas;
* badges;
* cores;
* espaçamento;
* hierarquia visual;
* estilo executivo/institucional.

## Estrutura sugerida

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

## Instalação

Instale as dependências:

```bash
npm install
```

Rode o projeto em desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto.

Exemplo:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=raio_x
POSTGRES_USER=readonly_user
POSTGRES_PASSWORD=change_me
```

Nunca versionar `.env.local`.

Credenciais de banco não devem usar prefixo `NEXT_PUBLIC_`.

Variáveis com `NEXT_PUBLIC_` ficam disponíveis no navegador e só devem ser usadas para valores públicos.

## Scripts

Scripts esperados:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run format
```

Se algum script ainda não existir, criar quando a necessidade aparecer.

## Banco de dados

A conexão com PostgreSQL deve ficar centralizada em:

```txt
lib/db/
```

Consultas SQL devem ficar em:

```txt
lib/queries/
```

Componentes React não devem abrir conexão direta com o banco.

Fluxo recomendado:

```txt
PostgreSQL/dbt
  ↓
lib/db
  ↓
lib/queries
  ↓
Server Component / Server Action / Route Handler
  ↓
Componentes visuais
```

## Convenções principais

### Páginas

Rotas e páginas ficam em:

```txt
app/
```

Use Server Components por padrão.

Use Client Components apenas quando houver interatividade real, como filtros no navegador, gráficos interativos, dropdowns ou controle local de estado.

### Componentes

Componentes visuais ficam em:

```txt
components/
```

Exemplos:

```txt
components/layout/app-sidebar.tsx
components/layout/dashboard-header.tsx
components/cards/kpi-card.tsx
components/charts/producao-mensal-chart.tsx
components/alerts/alert-list.tsx
components/tables/indicadores-aps-table.tsx
```

### Tipos

Tipos compartilhados ficam em:

```txt
types/
```

Tipos específicos de um componente podem ficar no próprio arquivo.

### Formatadores

Formatadores devem ficar em:

```txt
lib/formatters/
```

Exemplos:

```txt
number-format.ts
percent-format.ts
date-format.ts
competencia-format.ts
```

Evite espalhar formatação manual pela interface.

## shadcn/ui

Componentes base do shadcn/ui ficam em:

```txt
components/ui/
```

Evite editar esses componentes diretamente sem necessidade.

Para variações específicas do produto, crie wrappers em outras pastas.

Exemplo:

```txt
components/cards/kpi-card.tsx
```

## Gráficos

Usar Recharts para gráficos.

Componentes de gráfico devem ficar em:

```txt
components/charts/
```

Os dados devem chegar ao componente já prontos para renderização.

Evite transformação pesada dentro do gráfico.

## Segurança

Este projeto pode lidar com dados de saúde pública.

Regras:

* não expor dados pessoais identificáveis;
* não exibir CPF, CNS, endereço, telefone, nome de paciente ou dado individual sensível;
* preferir dados agregados;
* não versionar credenciais;
* não versionar dumps de dados;
* não logar dados sensíveis;
* não expor connection string ao navegador.

## Desenvolvimento com IA

O arquivo principal de orientação para IA é:

```txt
CLAUDE.md
```

Antes de pedir grandes alterações para uma IA, garanta que ela leia:

```txt
CLAUDE.md
reference/
```

Para mudanças envolvendo dados, a IA também pode consultar o projeto principal:

```txt
/home/moscarde/raio-x-engenharia
```

## Backlog

Ideias futuras e pendências devem ficar em:

```txt
notes/backlog.md
```

Não criar arquivos soltos de rascunho fora dessa pasta.

## Critérios básicos de entrega

Uma nova tela ou componente deve:

* renderizar sem erro;
* seguir a referência visual;
* estar tipado;
* não expor dado sensível;
* tratar estado vazio quando aplicável;
* manter queries isoladas da UI;
* manter componentes pequenos;
* evitar duplicação;
* usar dados da camada analítica correta.

## Licença

Definir conforme objetivo do projeto.

Para portfólio privado, manter sem licença pública ou adicionar aviso de uso interno.
