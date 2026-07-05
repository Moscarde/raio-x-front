import Link from "next/link";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
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
import { getResumoInternacoes } from "@/lib/queries/internacoes";
import { getProducaoMensal } from "@/lib/queries/producao-ambulatorial";
import { getIndicadoresAps } from "@/lib/queries/indicadores-aps";
import type { MunicipioResumo } from "@/types/municipio";
import type { ResumoInternacoes } from "@/types/internacao";
import type { ProducaoMensalPoint } from "@/types/producao-ambulatorial";

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

  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  const temDadoReal = disponiveis.some((m) => m.municipioId === municipioId);
  if (!temDadoReal) {
    return (
      <MunicipioSemDadosReais
        municipio={municipio}
        municipioId={municipioId}
        disponiveis={disponiveis}
      />
    );
  }

  const [totalCnes, estabelecimentosPorTipo, internacoes, producaoMensal, indicadoresAps] =
    await Promise.all([
      getTotalEstabelecimentosCnes(municipioId),
      getEstabelecimentosPorTipo(municipioId),
      getResumoInternacoes(municipioId),
      getProducaoMensal(municipioId),
      getIndicadoresAps(municipioId),
    ]);

  return (
    <PageShell
      sidebar={
        <AppSidebar
          municipioId={String(municipioId)}
          alertCount={0}
          atualizacoes={[
            { fonte: "CNES", competencia: "dez/2025" },
            { fonte: "SISAB", competencia: "2024Q3" },
          ]}
          usuario={{
            nome: "M. Cardoso",
            iniciais: "MC",
            orgao: `SMS ${municipio.nomeMunicipio}`,
          }}
        />
      }
    >
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
        producaoMensal={producaoMensal}
      />

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
            alertas={[]}
            emptyMessage="Nenhuma regra de alerta implementada ainda para este município (ver notes/backlog.md)."
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
            Metas oficiais por indicador ainda não estão na camada de dados
            — coluna de status foi omitida em vez de usar um limiar
            inventado (ver notes/backlog.md).
          </p>
        </DashboardCard>
      </ContentGrid>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: CNES · SIA · SIH · SISAB — DADOS REAIS (raio-x-engenharia)
      </p>
    </PageShell>
  );
}

type MunicipioSemDadosReaisProps = {
  municipio: MunicipioResumo;
  municipioId: number;
  disponiveis: MunicipioResumo[];
};

function MunicipioSemDadosReais({
  municipio,
  municipioId,
  disponiveis,
}: MunicipioSemDadosReaisProps) {
  return (
    <PageShell
      sidebar={
        <AppSidebar
          municipioId={String(municipioId)}
          alertCount={0}
          atualizacoes={[]}
          usuario={{ nome: "—", iniciais: "—", orgao: municipio.nomeMunicipio }}
        />
      }
    >
      <DashboardHeader
        kicker="Raio-X municipal"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · ${municipio.nomeMicrorregiao}`}
        actions={
          <MunicipioSelect
            municipios={disponiveis}
            municipioSelecionadoId={municipioId}
          />
        }
      />
      <p className="text-sm text-text-secondary">
        Dados ainda não carregados para este município. O MVP atual cobre
        Rio de Janeiro, Paraty e Nova Iguaçu — ver ROADMAP.md do
        raio-x-engenharia.
      </p>
    </PageShell>
  );
}

type VisaoGeralKpisProps = {
  totalCnes: number;
  internacoes: ResumoInternacoes;
  producaoMensal: ProducaoMensalPoint[];
};

function VisaoGeralKpis({
  totalCnes,
  internacoes,
  producaoMensal,
}: VisaoGeralKpisProps) {
  const ultimoPonto = producaoMensal.at(-1);
  const deltaProducao = calcularDeltaProducao(ultimoPonto);

  return (
    <ContentGrid className="grid-cols-5">
      <KpiCardPendente
        label="Cobertura APS"
        nota="Indicador de cobertura populacional pela APS ainda não disponível nesta camada de dados."
      />
      <KpiCardPendente
        label="Equipes ESF"
        nota="Cadastro de equipes de saúde da família ainda não carregado."
      />
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
