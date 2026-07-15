import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ContentGrid } from "@/components/layout/content-grid";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { KpiCard, KpiCardPendente } from "@/components/cards/kpi-card";
import { AlertList } from "@/components/alerts/alert-list";
import { RedeInstaladaBars } from "@/components/charts/rede-instalada-bars";
import { ProducaoMensalChart } from "@/components/charts/producao-mensal-chart";
import { IndicadoresApsTable } from "@/components/tables/indicadores-aps-table";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { PeriodoSelect } from "@/components/filters/periodo-select";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters/number-format";
import { formatPercent } from "@/lib/formatters/percent-format";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import { getMunicipioResumo, getMunicipiosDisponiveis } from "@/lib/queries/municipios";
import {
  getEstabelecimentosPorTipo,
  getTotalEstabelecimentosCnes,
} from "@/lib/queries/estabelecimentos";
import { getIcsapMunicipio, getResumoInternacoes } from "@/lib/queries/internacoes";
import { getProducaoMensalOrEmpty } from "@/lib/queries/producao-ambulatorial";
import { getIndicadoresAps } from "@/lib/queries/indicadores-aps";
import { getCoberturaAps } from "@/lib/queries/cobertura-aps";
import {
  getAlertasPrioritarios,
  getTotalAlertasAtivos,
} from "@/lib/queries/alertas";
import type { IndicadorIcsap, ResumoInternacoes } from "@/types/internacao";
import type { ProducaoMensalPoint } from "@/types/producao-ambulatorial";
import type { CoberturaApsMunicipio } from "@/types/cobertura-aps";

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function MunicipioVisaoGeralPage({ params }: PageProps) {
  const { municipioId: municipioIdParam } = await params;

  let municipioId: number;
  try {
    municipioId = parseMunicipioId(municipioIdParam);
  } catch {
    notFound();
  }

  const alertCount = await getTotalAlertasAtivos(municipioId);

  return (
    <PageShell
      sidebar={
        <AppSidebar
          municipioId={String(municipioId)}
          alertCount={alertCount}
          atualizacoes={[
            { fonte: "CNES", competencia: "dez/2025" },
            { fonte: "SISAB", competencia: "2024Q3" },
          ]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <VisaoGeralContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type VisaoGeralContentProps = {
  municipioId: number;
};

async function VisaoGeralContent({ municipioId }: VisaoGeralContentProps) {
  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  const [
    totalCnes,
    estabelecimentosPorTipo,
    internacoes,
    icsap,
    coberturaAps,
    producaoMensal,
    indicadoresAps,
    alertas,
  ] = await Promise.all([
    getTotalEstabelecimentosCnes(municipioId),
    getEstabelecimentosPorTipo(municipioId),
    getResumoInternacoes(municipioId),
    getIcsapMunicipio(municipioId),
    getCoberturaAps(municipioId),
    getProducaoMensalOrEmpty(municipioId),
    getIndicadoresAps(municipioId),
    getAlertasPrioritarios(municipioId, 4),
  ]);

  return (
    <>
      <DashboardHeader
        kicker="Raio-X municipal"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · ${municipio.nomeMicrorregiao}`}
        actions={
          <>
            <MunicipioSelect
              municipios={disponiveis}
              municipioSelecionadoId={municipioId}
            />
            <PeriodoSelect
              opcoes={[{ value: "2025", label: "2025 (ano completo)" }]}
              valorSelecionado="2025"
            />
            <Button
              disabled
              title="Relatório executivo ainda não implementado (ver ROADMAP.md, Fase 9)"
            >
              Gerar relatório executivo
            </Button>
          </>
        }
      />

      <VisaoGeralKpis
        totalCnes={totalCnes}
        internacoes={internacoes}
        icsap={icsap}
        coberturaAps={coberturaAps}
        producaoMensal={producaoMensal}
      />
      {icsap ? (
        <p className="text-[11px] text-text-secondary">
          ICSAP: grão é município de residência do paciente, ano{" "}
          {icsap.ano}. Denominador é o total de internações — a
          metodologia oficial completa restringe a internações clínicas,
          recorte que o SIH ainda não permite reproduzir integralmente.
        </p>
      ) : null}

      <ContentGrid className="grid-cols-[1.5fr_1fr]">
        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Produção ambulatorial — últimos 12 meses
          </span>
          <ProducaoMensalChart pontos={producaoMensal} />
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">
              Alertas priorizados
            </span>
            <Link
              href={`/municipios/${municipioId}/alertas`}
              className="text-[11px] font-semibold text-brand-primary"
            >
              Ver todos
            </Link>
          </div>
          <AlertList
            alertas={alertas}
          />
        </DashboardCard>
      </ContentGrid>

      <ContentGrid className="grid-cols-[1fr_1.5fr]">
        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Rede instalada
          </span>
          <RedeInstaladaBars itens={estabelecimentosPorTipo} />
        </DashboardCard>

        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Indicadores APS — Previne Brasil (
            {indicadoresAps[0]?.quadrimestre ?? "sem dado"})
          </span>
          <IndicadoresApsTable indicadores={indicadoresAps} />
          <p className="text-[11px] text-text-secondary">
            A meta é o mínimo pactuado. &ldquo;Meta atingida, abaixo do ideal&rdquo;
            indica que o resultado quadrimestral superou a meta, mas ainda não
            alcançou o parâmetro ideal oficial do Previne Brasil.
          </p>
        </DashboardCard>
      </ContentGrid>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: CNES · SIA · SIH · SISAB — DADOS REAIS (raio-x-engenharia)
      </p>
    </>
  );
}

type VisaoGeralKpisProps = {
  totalCnes: number;
  internacoes: ResumoInternacoes;
  icsap: IndicadorIcsap | null;
  coberturaAps: CoberturaApsMunicipio | null;
  producaoMensal: ProducaoMensalPoint[];
};

function VisaoGeralKpis({
  totalCnes,
  internacoes,
  icsap,
  coberturaAps,
  producaoMensal,
}: VisaoGeralKpisProps) {
  const ultimoPonto = producaoMensal.at(-1);
  const deltaProducao = calcularDeltaProducao(ultimoPonto);

  return (
    <ContentGrid className="grid-cols-6">
      {coberturaAps ? (
        <KpiCard
          label="Cobertura APS (ESF)"
          value={formatPercent(coberturaAps.percentualCoberturaEsf, 1)}
          trendLabel={`Cadastro vinculado · ${coberturaAps.anoReferenciaPopulacao}`}
        />
      ) : (
        <KpiCardPendente
          label="Cobertura APS"
          nota="Indicador de cobertura populacional pela APS ainda não disponível para este município."
        />
      )}
      {coberturaAps ? (
        <KpiCard
          label="Equipes ESF ativas"
          value={formatNumber(coberturaAps.quantidadeEquipesEsfAtivas)}
          trendLabel={`Cadastro CNES · ${coberturaAps.competenciaEquipesCnes}`}
        />
      ) : (
        <KpiCardPendente
          label="Equipes ESF"
          nota="Cadastro de equipes de saúde da família ainda não carregado para este município."
        />
      )}
      <KpiCard
        label="Unidades CNES"
        value={formatNumber(totalCnes)}
        trendLabel="Cadastro CNES · dez/2025"
      />
      <KpiCard
        label="Produção amb. / mês"
        value={ultimoPonto ? formatNumber(ultimoPonto.quantidadeAprovada) : "—"}
        trendLabel={
          deltaProducao !== null
            ? `${deltaProducao >= 0 ? "▲" : "▼"} ${formatPercent(Math.abs(deltaProducao), 1)} vs média do período`
            : undefined
        }
      />
      <KpiCard
        label="Internações (SIH)"
        value={formatNumber(internacoes.total)}
        trendLabel={
          internacoes.permanenciaMediaDias !== null
            ? `Permanência média: ${internacoes.permanenciaMediaDias} dias`
            : undefined
        }
      />
      {icsap ? (
        <KpiCard
          label="Internações ICSAP"
          value={formatPercent(icsap.percentualIcsap, 1)}
          trend={icsap.percentualIcsap >= 20 ? "atencao" : "neutro"}
          trendLabel={`Residentes · ${icsap.ano}`}
        />
      ) : (
        <KpiCardPendente
          label="Internações ICSAP"
          nota="Indicador de internações por condições sensíveis à APS ainda não disponível para este município."
        />
      )}
    </ContentGrid>
  );
}

function calcularDeltaProducao(
  ultimoPonto: ProducaoMensalPoint | undefined,
): number | null {
  if (!ultimoPonto || ultimoPonto.media12m <= 0) {
    return null;
  }
  return (
    ((ultimoPonto.quantidadeAprovada - ultimoPonto.media12m) /
      ultimoPonto.media12m) *
    100
  );
}
