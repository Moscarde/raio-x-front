import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ContentGrid } from "@/components/layout/content-grid";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { KpiCard } from "@/components/cards/kpi-card";
import { RedeInstaladaBars } from "@/components/charts/rede-instalada-bars";
import { EstabelecimentosTable } from "@/components/tables/estabelecimentos-table";
import { UnidadesEncerradasTable } from "@/components/tables/unidades-encerradas-table";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { formatNumber } from "@/lib/formatters/number-format";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";
import {
  getEstabelecimentosPorNaturezaJuridica,
  getEstabelecimentosPorTipo,
  getListaEstabelecimentos,
  getResumoRede,
  getTotalUnidadesPossivelmenteEncerradas,
  getUnidadesPossivelmenteEncerradas,
} from "@/lib/queries/estabelecimentos";
import { getTotalAlertasAtivos } from "@/lib/queries/alertas";

const LIMITE_TABELA = 100;

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function RedeCnesPage({ params }: PageProps) {
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
          atualizacoes={[{ fonte: "CNES", competencia: "dez/2025" }]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <RedeCnesContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type RedeCnesContentProps = {
  municipioId: number;
};

async function RedeCnesContent({ municipioId }: RedeCnesContentProps) {
  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  const [resumoRede, porTipo, porNatureza, lista, totalPossivelmenteEncerradas, possivelmenteEncerradas] = await Promise.all([
    getResumoRede(municipioId),
    getEstabelecimentosPorTipo(municipioId, 10),
    getEstabelecimentosPorNaturezaJuridica(municipioId, 8),
    getListaEstabelecimentos(municipioId, LIMITE_TABELA),
    getTotalUnidadesPossivelmenteEncerradas(municipioId),
    getUnidadesPossivelmenteEncerradas(municipioId, LIMITE_TABELA),
  ]);

  return (
    <>
      <DashboardHeader
        kicker="Rede e CNES"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · ${municipio.nomeMicrorregiao} · competência dez/2025`}
        actions={
          <MunicipioSelect
            municipios={disponiveis}
            municipioSelecionadoId={municipioId}
          />
        }
      />

      <ContentGrid className="grid-cols-4">
        <KpiCard
          label="Estabelecimentos cadastrados"
          value={formatNumber(resumoRede.totalEstabelecimentos)}
        />
        <KpiCard
          label="Com vínculo SUS"
          value={formatNumber(resumoRede.comVinculoSus)}
        />
        <KpiCard
          label="Tipos de unidade distintos"
          value={formatNumber(resumoRede.tiposDistintos)}
        />
        <KpiCard
          label="Possivelmente encerradas"
          value={formatNumber(totalPossivelmenteEncerradas)}
          trendLabel="Ausentes da competência CNES mais recente"
        />
      </ContentGrid>

      <ContentGrid className="grid-cols-2">
        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Estabelecimentos por tipo
          </span>
          <RedeInstaladaBars itens={porTipo} />
        </DashboardCard>

        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Estabelecimentos por natureza jurídica
          </span>
          <RedeInstaladaBars itens={porNatureza} />
        </DashboardCard>
      </ContentGrid>

      <DashboardCard>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            Unidades cadastradas
          </span>
          <span className="text-[11px] text-text-secondary">
            Exibindo {formatNumber(lista.length)} de{" "}
            {formatNumber(resumoRede.totalEstabelecimentos)}
          </span>
        </div>
        <EstabelecimentosTable estabelecimentos={lista} />
      </DashboardCard>

      <DashboardCard>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            Auditoria de unidades possivelmente encerradas
          </span>
          <span className="text-[11px] text-text-secondary">
            Exibindo {formatNumber(possivelmenteEncerradas.length)} de{" "}
            {formatNumber(totalPossivelmenteEncerradas)}
          </span>
        </div>
        <UnidadesEncerradasTable unidades={possivelmenteEncerradas} />
      </DashboardCard>

      <p className="text-[11px] text-text-secondary">
        Fonte: CNES, competências de janeiro a dezembro/2025. &ldquo;Possivelmente
        encerrada&rdquo; indica ausência da última competência carregada; é um
        sinal para auditoria, não confirmação de encerramento.
      </p>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: CNES — DADOS REAIS (raio-x-engenharia)
      </p>
    </>
  );
}
