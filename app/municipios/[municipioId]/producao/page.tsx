import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ContentGrid } from "@/components/layout/content-grid";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { KpiCard } from "@/components/cards/kpi-card";
import { ProducaoMensalChart } from "@/components/charts/producao-mensal-chart";
import { ProducaoPorGrupoBars } from "@/components/charts/producao-por-grupo-bars";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { formatNumber } from "@/lib/formatters/number-format";
import { formatCurrency } from "@/lib/formatters/currency-format";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";
import {
  getProducaoMensal,
  getProducaoPorGrupo,
} from "@/lib/queries/producao-ambulatorial";

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function ProducaoPage({ params }: PageProps) {
  const { municipioId: municipioIdParam } = await params;

  let municipioId: number;
  try {
    municipioId = parseMunicipioId(municipioIdParam);
  } catch {
    notFound();
  }

  return (
    <PageShell
      sidebar={
        <AppSidebar
          municipioId={String(municipioId)}
          alertCount={0}
          atualizacoes={[{ fonte: "SIA", competencia: "dez/2025" }]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <ProducaoContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type ProducaoContentProps = {
  municipioId: number;
};

async function ProducaoContent({ municipioId }: ProducaoContentProps) {
  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  const [producaoMensal, porGrupo] = await Promise.all([
    getProducaoMensal(municipioId),
    getProducaoPorGrupo(municipioId),
  ]);

  const totalQuantidade = producaoMensal.reduce(
    (soma, ponto) => soma + ponto.quantidadeAprovada,
    0,
  );
  const totalValor = porGrupo.reduce(
    (soma, item) => soma + item.valorAprovado,
    0,
  );

  return (
    <>
      <DashboardHeader
        kicker="Produção ambulatorial"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · SIA/SUS, 2025`}
        actions={
          <MunicipioSelect
            municipios={disponiveis}
            municipioSelecionadoId={municipioId}
          />
        }
      />

      <ContentGrid className="grid-cols-2">
        <KpiCard
          label="Procedimentos aprovados (12m)"
          value={formatNumber(totalQuantidade)}
        />
        <KpiCard
          label="Valor aprovado (top 10 grupos)"
          value={formatCurrency(totalValor)}
        />
      </ContentGrid>

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Produção por competência
        </span>
        <ProducaoMensalChart pontos={producaoMensal} />
      </DashboardCard>

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Produção por grupo de procedimento (SIGTAP)
        </span>
        <ProducaoPorGrupoBars itens={porGrupo} />
        <p className="text-[11px] text-text-secondary">
          Grupo SIGTAP = 2 primeiros dígitos do código de 10 dígitos do
          procedimento. Município é o do estabelecimento de atendimento, não
          o de residência do paciente.
        </p>
      </DashboardCard>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: SIA — DADOS REAIS (raio-x-engenharia)
      </p>
    </>
  );
}
