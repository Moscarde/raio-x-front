import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { ContentGrid } from "@/components/layout/content-grid";
import { KpiCard, KpiCardPendente } from "@/components/cards/kpi-card";
import { Button } from "@/components/ui/button";
import { MunicipioComparadorSelect } from "@/components/filters/municipio-comparador-select";
import { CriterioPareamentoSelect } from "@/components/filters/criterio-pareamento-select";
import { ComparacaoMunicipiosChips } from "@/components/filters/comparacao-municipios-chips";
import { ComparacaoIndicadoresTable } from "@/components/tables/comparacao-indicadores-table";
import { ComparacaoBarraHorizontal } from "@/components/charts/comparacao-barra-horizontal";
import { formatPercent } from "@/lib/formatters/percent-format";
import { getTotalAlertasAtivos } from "@/lib/queries/alertas";
import { getCoberturaAps } from "@/lib/queries/cobertura-aps";
import { getIcsapMunicipio } from "@/lib/queries/internacoes";
import {
  calcularDestaques,
  calcularPosicao,
  getMunicipiosComparacaoRj,
  montarLinhasComparativas,
  selecionarPares,
} from "@/lib/queries/comparacao-municipios";
import type {
  CriterioPareamento,
  DestaqueComparativo,
  MunicipioComparacaoRj,
} from "@/types/comparacao-municipio";
import type { CoberturaApsMunicipio } from "@/types/cobertura-aps";
import type { IndicadorIcsap } from "@/types/internacao";

const MUNICIPIO_PADRAO_ID = 3304557; // Rio de Janeiro — maior município de referência
const LIMITE_PARES = 5;
const CRITERIOS_VALIDOS: CriterioPareamento[] = ["populacao", "porte_rede", "regiao"];

type PageProps = {
  searchParams: Promise<{ municipioId?: string; criterio?: string; extra?: string }>;
};

export default async function ComparadorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PageShell
      sidebar={
        <Suspense fallback={null}>
          <ComparadorSidebar municipioIdParam={params.municipioId} />
        </Suspense>
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <ComparadorContent
          municipioIdParam={params.municipioId}
          criterioParam={params.criterio}
          extraParam={params.extra}
        />
      </Suspense>
    </PageShell>
  );
}

async function ComparadorSidebar({
  municipioIdParam,
}: {
  municipioIdParam?: string;
}) {
  const municipioId = Number(municipioIdParam) || MUNICIPIO_PADRAO_ID;
  const alertCount = await getTotalAlertasAtivos(municipioId);

  return (
    <AppSidebar
      municipioId={String(municipioId)}
      alertCount={alertCount}
      atualizacoes={[
        { fonte: "CNES", competencia: "dez/2025" },
        { fonte: "SISAB", competencia: "2024Q3" },
      ]}
      usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
    />
  );
}

type ComparadorContentProps = {
  municipioIdParam?: string;
  criterioParam?: string;
  extraParam?: string;
};

async function ComparadorContent({
  municipioIdParam,
  criterioParam,
  extraParam,
}: ComparadorContentProps) {
  const todos = await getMunicipiosComparacaoRj();

  const alvo =
    todos.find((m) => m.municipioId === Number(municipioIdParam)) ??
    todos.find((m) => m.municipioId === MUNICIPIO_PADRAO_ID) ??
    todos[0];

  if (!alvo) {
    return (
      <p className="text-sm text-text-secondary">
        Nenhum município do RJ disponível para comparação no momento.
      </p>
    );
  }

  const criterio = CRITERIOS_VALIDOS.includes(criterioParam as CriterioPareamento)
    ? (criterioParam as CriterioPareamento)
    : "populacao";

  const pares = selecionarPares(alvo, todos, criterio, LIMITE_PARES);
  const paresIds = pares.map((m) => m.municipioId);

  const extraIds = (extraParam ?? "")
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id !== alvo.municipioId && !paresIds.includes(id));
  const extras = extraIds
    .map((id) => todos.find((m) => m.municipioId === id))
    .filter((m): m is MunicipioComparacaoRj => m !== undefined);

  const conjunto = [alvo, ...pares, ...extras];

  const [coberturaPorMunicipio, icsapPorMunicipio] = await buscarIndicadoresRestritos(
    conjunto,
  );

  const linhas = montarLinhasComparativas(conjunto, coberturaPorMunicipio, icsapPorMunicipio);
  const { pontoForte, pontoFraco } = calcularDestaques(linhas, alvo.municipioId);
  const linhaPorteRede = linhas.find((l) => l.chave === "porte_rede");
  const posicaoRanking = linhaPorteRede
    ? calcularPosicao(linhaPorteRede.valores, true, alvo.municipioId)
    : null;
  const linhaProducao = linhas.find((l) => l.chave === "producao_per_capita");

  return (
    <>
      <DashboardHeader
        kicker="Comparador de municípios"
        title={`${alvo.nomeMunicipio} vs. pares`}
        subtitle={`Critério: ${rotuloCriterio(criterio)} · ${conjunto.length} municípios`}
        actions={
          <>
            <MunicipioComparadorSelect
              municipios={todos}
              municipioSelecionadoId={alvo.municipioId}
              criterio={criterio}
            />
            <CriterioPareamentoSelect
              municipioId={alvo.municipioId}
              criterioSelecionado={criterio}
            />
            <Button
              disabled
              title="Exportação de comparação ainda não implementada"
            >
              Exportar comparação
            </Button>
          </>
        }
      />

      <ComparacaoMunicipiosChips
        todos={todos}
        alvoId={alvo.municipioId}
        paresIds={paresIds}
        extraIds={extraIds}
        criterio={criterio}
      />

      <ContentGrid className="grid-cols-3">
        {posicaoRanking ? (
          <KpiCard
            label="Posição (porte de rede)"
            value={`${posicaoRanking.posicao}º de ${posicaoRanking.total}`}
            trend={posicaoRanking.posicao <= Math.ceil(posicaoRanking.total / 2) ? "positivo" : "atencao"}
            trendLabel="Estabelecimentos por 10k hab."
          />
        ) : (
          <KpiCardPendente label="Posição" nota="Sem dado de porte de rede para ranquear." />
        )}
        <DestaqueKpi label="Ponto forte" destaque={pontoForte} trend="positivo" />
        <DestaqueKpi label="Ponto de atenção" destaque={pontoFraco} trend="negativo" />
      </ContentGrid>

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Indicadores lado a lado
        </span>
        <ComparacaoIndicadoresTable
          municipios={conjunto}
          linhas={linhas}
          alvoId={alvo.municipioId}
        />
        <p className="text-[11px] text-text-secondary">
          Cobertura APS e ICSAP contemplam os 92 municípios do RJ. ICSAP usa
          como denominador o total de internações do município de residência
          (metodologia oficial completa restringe a internações clínicas,
          recorte que o SIH ainda não permite reproduzir integralmente).
        </p>
      </DashboardCard>

      <ContentGrid className="grid-cols-[1fr_1fr]">
        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Porte de rede (estab./10k hab.)
          </span>
          <ComparacaoBarraHorizontal
            pontos={pontosParaGrafico(conjunto, linhaPorteRede)}
            alvoId={alvo.municipioId}
            maiorMelhor
          />
        </DashboardCard>
        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Produção ambulatorial (por mil hab., 2025)
          </span>
          <ComparacaoBarraHorizontal
            pontos={pontosParaGrafico(conjunto, linhaProducao)}
            alvoId={alvo.municipioId}
            maiorMelhor
          />
        </DashboardCard>
      </ContentGrid>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: IBGE · CNES · SIA · SIH · SISAB — DADOS REAIS (raio-x-engenharia)
      </p>
    </>
  );
}

async function buscarIndicadoresRestritos(
  conjunto: MunicipioComparacaoRj[],
): Promise<[Map<number, CoberturaApsMunicipio | null>, Map<number, IndicadorIcsap | null>]> {
  const resultados = await Promise.all(
    conjunto.map(async (municipio) => {
      const [cobertura, icsap] = await Promise.all([
        getCoberturaAps(municipio.municipioId),
        getIcsapMunicipio(municipio.municipioId),
      ]);
      return { municipioId: municipio.municipioId, cobertura, icsap };
    }),
  );

  const coberturaPorMunicipio = new Map(
    resultados.map((r) => [r.municipioId, r.cobertura]),
  );
  const icsapPorMunicipio = new Map(resultados.map((r) => [r.municipioId, r.icsap]));
  return [coberturaPorMunicipio, icsapPorMunicipio];
}

function pontosParaGrafico(
  municipios: MunicipioComparacaoRj[],
  linha: ReturnType<typeof montarLinhasComparativas>[number] | undefined,
) {
  if (!linha) {
    return [];
  }
  return municipios.map((municipio) => {
    const valor = linha.valores.find((v) => v.municipioId === municipio.municipioId);
    return {
      municipioId: municipio.municipioId,
      nomeMunicipio: municipio.nomeMunicipio,
      valor: valor?.valor ?? 0,
      valorFormatado: valor?.valorFormatado ?? "—",
    };
  });
}

function rotuloCriterio(criterio: CriterioPareamento): string {
  if (criterio === "populacao") return "população mais próxima";
  if (criterio === "porte_rede") return "porte de rede mais próximo";
  return "mesma região (microrregião)";
}

function DestaqueKpi({
  label,
  destaque,
  trend,
}: {
  label: string;
  destaque: DestaqueComparativo | null;
  trend: "positivo" | "negativo";
}) {
  if (!destaque) {
    return (
      <KpiCardPendente
        label={label}
        nota="Dado insuficiente entre os pares comparados para calcular este indicador."
      />
    );
  }

  return (
    <KpiCard
      label={label}
      value={destaque.rotulo}
      trend={trend}
      trendLabel={`${destaque.percentualVsPares >= 0 ? "+" : ""}${formatPercent(destaque.percentualVsPares, 0)} vs. média dos pares`}
    />
  );
}
