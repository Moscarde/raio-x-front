import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function RelatorioPage({ params }: PageProps) {
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
          atualizacoes={[]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <RelatorioContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type RelatorioContentProps = {
  municipioId: number;
};

async function RelatorioContent({ municipioId }: RelatorioContentProps) {
  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  return (
    <>
      <DashboardHeader
        kicker="Relatório executivo"
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
          Geração de relatório com IA — pendente de decisão de arquitetura
        </span>
        <p className="max-w-2xl text-xs text-text-secondary">
          Esta função depende de uma decisão que ainda não foi tomada: se a
          geração roda como server action síncrona, fila assíncrona ou
          serviço externo de IA, e em qual formato o relatório é entregue
          (PDF, apresentação, ou ambos). Ver a Fase 9 do <code>ROADMAP.md</code>{" "}
          e a seção correspondente em <code>notes/backlog.md</code>.
        </p>
        <p className="max-w-2xl text-xs text-text-secondary">
          Enquanto isso, os dados reais que alimentariam o relatório já
          estão disponíveis nas outras telas deste município: Visão Geral,
          Rede e CNES, Atenção Primária e Produção.
        </p>
      </DashboardCard>
    </>
  );
}
