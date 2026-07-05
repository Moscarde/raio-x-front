import Link from "next/link";

type SecaoIndicador = {
  titulo: string;
  oQueMede: string;
  fonte: string;
  granularidade: string;
  periodo: string;
  regraDeCalculo: string;
  limitacoes: string[];
};

const SECOES: SecaoIndicador[] = [
  {
    titulo: "Rede e CNES",
    oQueMede:
      "Estabelecimentos de saúde cadastrados no município (tipo de unidade, natureza jurídica, gestão, vínculo SUS).",
    fonte: "CNES (Cadastro Nacional de Estabelecimentos de Saúde), DATASUS.",
    granularidade: "1 linha por estabelecimento (código CNES).",
    periodo: "Competência única: dezembro/2025.",
    regraDeCalculo:
      "Contagem direta por tipo de unidade e por natureza jurídica; nenhuma agregação de negócio aplicada.",
    limitacoes: [
      "Snapshot único — não há série histórica de cadastro, então não é possível ver abertura/fechamento de unidades ao longo do tempo.",
      "Sem campo de situação (ativo/inativo/suspenso): o que aparece é o cadastro completo da competência, não um recorte de unidades em funcionamento.",
      "Sem nome do estabelecimento (razão social ou nome fantasia) — só o código CNES.",
      "24 de 33 tipos de unidade e ~72% das naturezas jurídicas têm descrição legível confirmada contra fonte oficial; os demais aparecem como 'Código NN'.",
    ],
  },
  {
    titulo: "Produção ambulatorial",
    oQueMede:
      "Procedimentos ambulatoriais aprovados para pagamento pelo SUS (quantidade e valor).",
    fonte: "SIA/SUS (Sistema de Informações Ambulatoriais), DATASUS.",
    granularidade: "1 linha por procedimento produzido.",
    periodo: "Janeiro a dezembro de 2025 (12 competências), estado do RJ inteiro.",
    regraDeCalculo:
      "Soma de quantidade e valor aprovados por competência (mês) e por grupo de procedimento (2 primeiros dígitos do código SIGTAP), filtrado pelo município do estabelecimento de atendimento.",
    limitacoes: [
      "Município é o do estabelecimento de atendimento, não o de residência do paciente.",
      "Códigos de procedimento e de grupo aparecem crus — não existe seed de-para para nome legível ainda.",
      "\"Abaixo da média\" no gráfico é um destaque visual (mês abaixo de 85% da média do período exibido), não uma classificação oficial de anomalia.",
      "Consulta agrega uma tabela de 99,9M+ linhas sem pré-agregação por município no dbt — resultado é cacheado por até 24h.",
    ],
  },
  {
    titulo: "Internações",
    oQueMede: "Internações hospitalares (contagem e permanência média).",
    fonte: "SIH/SUS (Sistema de Informações Hospitalares), DATASUS.",
    granularidade: "1 linha por AIH (Autorização de Internação Hospitalar).",
    periodo: "2025 completo (12 competências).",
    regraDeCalculo:
      "Contagem de AIH e média de dias de permanência, filtrado pelo município do estabelecimento.",
    limitacoes: [
      "Município é o do estabelecimento, não o de residência do paciente.",
      "Não há classificação de internações por condição sensível à atenção primária (ICSAP) — o diagnóstico principal é o código CID-10 cru, sem lista de classificação aplicada.",
    ],
  },
  {
    titulo: "Indicadores APS (Previne Brasil)",
    oQueMede:
      "Indicadores de desempenho da Atenção Primária à Saúde usados para o financiamento do Previne Brasil (pré-natal, citopatológico, vacinação, diabetes, entre outros).",
    fonte: "SISAB, via API de Dados Abertos do Ministério da Saúde (DEMAS).",
    granularidade: "1 linha por indicador × visão de equipe (geral/homologadas/válidas) × quadrimestre.",
    periodo:
      "2024Q3 — o Previne Brasil foi extinto pela Portaria GM/MS Nº 3.493/2024 e substituído por nova metodologia; este é o último quadrimestre disponível na fonte, não há série mais recente.",
    regraDeCalculo:
      "Percentual já vem calculado pela fonte (numerador/denominador conforme regra oficial do indicador). A Visão Geral usa a visão \"válidas\", que é a usada oficialmente para o cálculo de financiamento; a página de Atenção Primária mostra as 3 visões lado a lado.",
    limitacoes: [
      "Não há coluna de meta oficial por indicador na camada de dados atual — por isso as telas mostram só o resultado, sem status (Meta ok/Atenção/Crítico), para não inventar um limiar.",
      "\"População coberta\" de um indicador é o denominador de referência daquele indicador específico (base SISAB), não a população total do município — não existe população total do IBGE na camada de dados hoje.",
    ],
  },
];

export default function DocumentacaoPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 bg-background px-6 py-12">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10.5px] font-medium tracking-wide text-text-secondary uppercase">
          Documentação
        </span>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Metodologia e fontes dos indicadores
        </h1>
        <p className="text-sm text-text-secondary">
          O que cada indicador mede, de onde vem e quais são as limitações
          conhecidas. Ver também{" "}
          <Link
            href="/qualidade-dados"
            className="font-semibold text-brand-primary"
          >
            qualidade e cobertura dos dados
          </Link>
          .
        </p>
      </div>

      {SECOES.map((secao) => (
        <div
          key={secao.titulo}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        >
          <span className="text-sm font-semibold text-text-primary">
            {secao.titulo}
          </span>

          <dl className="flex flex-col gap-2 text-[12.5px]">
            <div>
              <dt className="font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                O que mede
              </dt>
              <dd className="text-text-primary">{secao.oQueMede}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                Fonte
              </dt>
              <dd className="text-text-primary">{secao.fonte}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                Granularidade
              </dt>
              <dd className="text-text-primary">{secao.granularidade}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                Período de referência
              </dt>
              <dd className="text-text-primary">{secao.periodo}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                Regra de cálculo
              </dt>
              <dd className="text-text-primary">{secao.regraDeCalculo}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
                Limitações
              </dt>
              <dd>
                <ul className="list-disc pl-4 text-text-secondary">
                  {secao.limitacoes.map((limitacao) => (
                    <li key={limitacao}>{limitacao}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      ))}

      <Link
        href="/"
        className="self-start text-xs font-semibold text-brand-primary"
      >
        ← Voltar para a Visão Geral
      </Link>
    </div>
  );
}
