import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { AlertList } from "@/components/alerts/alert-list";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";

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

  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

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
          alertas={[]}
          emptyMessage="Nenhuma regra de alerta implementada ainda para este município. A Visão Geral mostra CNES, produção e indicadores APS reais, mas a classificação de 'alerta' (ex.: CNES desatualizado, queda de produção) depende de regras de negócio que ainda não existem no dbt — ver notes/backlog.md."
        />
      </DashboardCard>
    </PageShell>
  );
}
