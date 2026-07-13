import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { AlertList } from "@/components/alerts/alert-list";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";
import {
  getAlertasPrioritarios,
  getTotalAlertasAtivos,
} from "@/lib/queries/alertas";

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function AlertasPage({ params }: PageProps) {
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
        <AlertasContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type AlertasContentProps = {
  municipioId: number;
};

async function AlertasContent({ municipioId }: AlertasContentProps) {
  const [municipio, disponiveis, alertas] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
    getAlertasPrioritarios(municipioId),
  ]);

  if (!municipio) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        kicker="Alertas"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · ${municipio.nomeMicrorregiao}`}
        actions={
          <MunicipioSelect
            municipios={disponiveis}
            municipioSelecionadoId={municipioId}
          />
        }
      />

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Todos os alertas
        </span>
        <AlertList
          alertas={alertas}
          emptyMessage="Nenhum alerta ativo para este município na atualização mais recente."
        />
      </DashboardCard>
    </>
  );
}
