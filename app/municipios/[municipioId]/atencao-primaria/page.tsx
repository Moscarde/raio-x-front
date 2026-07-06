import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { formatPercent } from "@/lib/formatters/percent-format";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";
import { getIndicadoresApsPorVisao } from "@/lib/queries/indicadores-aps";
import type { IndicadorApsPorVisao } from "@/types/indicador-aps";

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function AtencaoPrimariaPage({ params }: PageProps) {
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
          atualizacoes={[{ fonte: "SISAB", competencia: "2024Q3" }]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <AtencaoPrimariaContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type AtencaoPrimariaContentProps = {
  municipioId: number;
};

async function AtencaoPrimariaContent({
  municipioId,
}: AtencaoPrimariaContentProps) {
  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  const indicadoresPorVisao = await getIndicadoresApsPorVisao(municipioId);
  const linhas = agruparPorIndicador(indicadoresPorVisao);

  return (
    <>
      <DashboardHeader
        kicker="Atenção Primária"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · Previne Brasil, 2024Q3`}
        actions={
          <MunicipioSelect
            municipios={disponiveis}
            municipioSelecionadoId={municipioId}
          />
        }
      />

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Indicadores por visão de equipe
        </span>
        <IndicadoresPorVisaoTable linhas={linhas} />
        <p className="text-[11px] text-text-secondary">
          &ldquo;Válidas&rdquo; é a visão usada oficialmente para o cálculo
          de financiamento do Previne Brasil; &ldquo;geral&rdquo; e
          &ldquo;homologadas&rdquo; existem na mesma base mas não são o
          número usado para pagamento (ver
          lib/queries/indicadores-aps.ts). Metas oficiais por indicador
          ainda não estão na camada de dados (ver notes/backlog.md). O
          Previne Brasil foi extinto em 2024 — 2024Q3 é o último
          quadrimestre disponível, não há série mais recente para comparar.
        </p>
      </DashboardCard>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: SISAB — DADOS REAIS (raio-x-engenharia)
      </p>
    </>
  );
}

type LinhaIndicador = {
  numeroIndicador: number;
  descricaoIndicador: string;
  geral: number | null;
  homologadas: number | null;
  validas: number | null;
};

function agruparPorIndicador(
  indicadores: IndicadorApsPorVisao[],
): LinhaIndicador[] {
  const porNumero = new Map<number, LinhaIndicador>();

  for (const indicador of indicadores) {
    const linha = porNumero.get(indicador.numeroIndicador) ?? {
      numeroIndicador: indicador.numeroIndicador,
      descricaoIndicador: indicador.descricaoIndicador,
      geral: null,
      homologadas: null,
      validas: null,
    };
    linha[indicador.visaoEquipe] = indicador.percentual;
    porNumero.set(indicador.numeroIndicador, linha);
  }

  return [...porNumero.values()].sort(
    (a, b) => a.numeroIndicador - b.numeroIndicador,
  );
}

function IndicadoresPorVisaoTable({ linhas }: { linhas: LinhaIndicador[] }) {
  if (linhas.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum indicador Previne Brasil carregado para este município.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>Indicador</span>
        <span className="text-right">Geral</span>
        <span className="text-right">Homologadas</span>
        <span className="text-right">Válidas</span>
      </div>
      {linhas.map((linha) => (
        <div
          key={linha.numeroIndicador}
          className="grid grid-cols-[2.4fr_1fr_1fr_1fr] items-center gap-2 border-b border-border-hairline py-2 text-[12.5px] text-text-primary last:border-0"
        >
          <span>{linha.descricaoIndicador}</span>
          <span className="text-right">
            {linha.geral === null ? "—" : formatPercent(linha.geral, 0)}
          </span>
          <span className="text-right">
            {linha.homologadas === null
              ? "—"
              : formatPercent(linha.homologadas, 0)}
          </span>
          <span className="text-right font-display font-semibold">
            {linha.validas === null ? "—" : formatPercent(linha.validas, 0)}
          </span>
        </div>
      ))}
    </div>
  );
}
