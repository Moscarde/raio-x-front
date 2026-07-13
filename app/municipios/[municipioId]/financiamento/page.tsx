import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { PageContentSkeleton } from "@/components/layout/page-content-skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ContentGrid } from "@/components/layout/content-grid";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { KpiCard, KpiCardPendente } from "@/components/cards/kpi-card";
import { LancamentosRepassesTable } from "@/components/tables/lancamentos-repasses-table";
import { MunicipioSelect } from "@/components/filters/municipio-select";
import { formatCurrency } from "@/lib/formatters/currency-format";
import { formatPercent } from "@/lib/formatters/percent-format";
import { parseMunicipioId } from "@/lib/validators/municipio-validator";
import {
  getMunicipioResumo,
  getMunicipiosDisponiveis,
} from "@/lib/queries/municipios";
import {
  getAplicacaoSaude,
  getLancamentosRepasses,
  getRepassesPorFonte,
  getResumoRepasses,
} from "@/lib/queries/financiamento";
import { getTotalAlertasAtivos } from "@/lib/queries/alertas";
import type {
  AplicacaoSaudeMunicipio,
  FonteRepasse,
  RepassePorFonte,
} from "@/types/financiamento";

const LIMITE_LANCAMENTOS = 20;
const ROTULO_FONTE: Record<FonteRepasse, string> = {
  fns_fundo_a_fundo: "FNS · Fundo a Fundo",
  portal_transparencia: "Portal da Transparência",
};

type PageProps = {
  params: Promise<{ municipioId: string }>;
};

export default async function FinanciamentoPage({ params }: PageProps) {
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
          atualizacoes={[{ fonte: "SIOPS", competencia: "2025 · bim. 6" }]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <FinanciamentoContent municipioId={municipioId} />
      </Suspense>
    </PageShell>
  );
}

type FinanciamentoContentProps = {
  municipioId: number;
};

async function FinanciamentoContent({ municipioId }: FinanciamentoContentProps) {
  const [municipio, disponiveis] = await Promise.all([
    getMunicipioResumo(municipioId),
    getMunicipiosDisponiveis(),
  ]);

  if (!municipio) {
    notFound();
  }

  const [aplicacaoSaude, resumoRepasses, repassesPorFonte, lancamentos] =
    await Promise.all([
      getAplicacaoSaude(municipioId),
      getResumoRepasses(municipioId),
      getRepassesPorFonte(municipioId),
      getLancamentosRepasses(municipioId, LIMITE_LANCAMENTOS),
    ]);

  return (
    <>
      <DashboardHeader
        kicker="Financiamento da saúde"
        title={municipio.nomeMunicipio}
        subtitle={`${municipio.siglaUf} · ${municipio.nomeMicrorregiao}`}
        actions={
          <MunicipioSelect
            municipios={disponiveis}
            municipioSelecionadoId={municipioId}
          />
        }
      />

      <FinanciamentoKpis aplicacaoSaude={aplicacaoSaude} saldoLiquido={resumoRepasses.saldoLiquido} />

      <ContentGrid className="grid-cols-[1fr_1.5fr]">
        <DashboardCard>
          <span className="text-sm font-semibold text-text-primary">
            Repasses por fonte
          </span>
          <RepassesPorFonteLista itens={repassesPorFonte} />
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">
              Lançamentos de repasses federais
            </span>
            <span className="text-[11px] text-text-secondary">
              Exibindo {lancamentos.length} de {resumoRepasses.totalLancamentos}
            </span>
          </div>
          <LancamentosRepassesTable lancamentos={lancamentos} />
        </DashboardCard>
      </ContentGrid>

      <p className="text-[11px] text-text-secondary">
        Aplicação em saúde: percentual de receita de impostos aplicado em
        ações e serviços públicos de saúde, apurado até o
        {" "}
        {aplicacaoSaude?.periodoBimestre ?? "—"}º bimestre de{" "}
        {aplicacaoSaude?.anoExercicio ?? "—"} (RREO Anexo 14, SICONFI/Tesouro
        Nacional) — mínimo constitucional definido pela LC 141/2012. Saldo
        líquido de repasses soma FNS Fundo a Fundo e Portal da Transparência
        já com sinal normalizado pela mart (crédito positivo, débito/estorno
        negativo); a mart de repasses FNS isolada não é usada separadamente
        aqui porque cobre o mesmo dado bruto já incorporado a este saldo,
        evitando contar o mesmo lançamento duas vezes.
      </p>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: SICONFI · FNS · Portal da Transparência — DADOS REAIS (raio-x-engenharia)
      </p>
    </>
  );
}

type FinanciamentoKpisProps = {
  aplicacaoSaude: AplicacaoSaudeMunicipio | null;
  saldoLiquido: number;
};

function FinanciamentoKpis({ aplicacaoSaude, saldoLiquido }: FinanciamentoKpisProps) {
  return (
    <ContentGrid className="grid-cols-4">
      {aplicacaoSaude ? (
        <KpiCard
          label="Aplicação em saúde"
          value={formatPercent(aplicacaoSaude.percentualAplicado, 1)}
          trend={aplicacaoSaude.status === "ok" ? "positivo" : "negativo"}
          trendLabel={`Mínimo constitucional: ${formatPercent(aplicacaoSaude.percentualMinimoExigido, 0)}`}
        />
      ) : (
        <KpiCardPendente
          label="Aplicação em saúde"
          nota="Demonstrativo SIOPS/SICONFI ainda não disponível para este município."
        />
      )}
      {aplicacaoSaude ? (
        <KpiCard
          label="Valor apurado em saúde"
          value={formatCurrency(aplicacaoSaude.valorApuradoSaude)}
          trendLabel={`Até o ${aplicacaoSaude.periodoBimestre}º bimestre/${aplicacaoSaude.anoExercicio}`}
        />
      ) : (
        <KpiCardPendente
          label="Valor apurado em saúde"
          nota="Demonstrativo SIOPS/SICONFI ainda não disponível para este município."
        />
      )}
      <KpiCard
        label="Saldo líquido de repasses"
        value={formatCurrency(saldoLiquido)}
        trend={saldoLiquido >= 0 ? "positivo" : "negativo"}
        trendLabel="FNS Fundo a Fundo + Portal da Transparência"
      />
      {aplicacaoSaude ? (
        <KpiCard
          label="Receita corrente realizada"
          value={formatCurrency(aplicacaoSaude.receitaRealizada)}
          trendLabel={`Até o ${aplicacaoSaude.periodoBimestre}º bimestre/${aplicacaoSaude.anoExercicio}`}
        />
      ) : (
        <KpiCardPendente
          label="Receita corrente realizada"
          nota="Demonstrativo SIOPS/SICONFI ainda não disponível para este município."
        />
      )}
    </ContentGrid>
  );
}

function RepassesPorFonteLista({ itens }: { itens: RepassePorFonte[] }) {
  if (itens.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum repasse federal carregado para este município.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {itens.map((item) => (
        <div key={item.fonte} className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-primary">{ROTULO_FONTE[item.fonte]}</span>
          <span
            className={`font-display text-sm font-semibold ${item.saldoLiquido >= 0 ? "text-text-primary" : "text-danger"}`}
          >
            {formatCurrency(item.saldoLiquido)}
          </span>
        </div>
      ))}
    </div>
  );
}
