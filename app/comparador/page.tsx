import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { formatNumber } from "@/lib/formatters/number-format";
import { formatPercent } from "@/lib/formatters/percent-format";
import { getMunicipiosDisponiveis } from "@/lib/queries/municipios";
import { getTotalEstabelecimentosCnes } from "@/lib/queries/estabelecimentos";
import { getResumoInternacoes } from "@/lib/queries/internacoes";
import { getProducaoMensal } from "@/lib/queries/producao-ambulatorial";
import { getIndicadoresAps } from "@/lib/queries/indicadores-aps";
import type { MunicipioResumo } from "@/types/municipio";
import type { ResumoInternacoes } from "@/types/internacao";
import type { IndicadorAps } from "@/types/indicador-aps";

type LinhaComparativa = {
  municipio: MunicipioResumo;
  totalCnes: number;
  internacoes: ResumoInternacoes;
  producaoUltimoMes: number | null;
  indicadoresAps: IndicadorAps[];
};

async function buscarLinhaComparativa(
  municipio: MunicipioResumo,
): Promise<LinhaComparativa> {
  const [totalCnes, internacoes, producaoMensal, indicadoresAps] =
    await Promise.all([
      getTotalEstabelecimentosCnes(municipio.municipioId),
      getResumoInternacoes(municipio.municipioId),
      getProducaoMensal(municipio.municipioId),
      getIndicadoresAps(municipio.municipioId),
    ]);

  return {
    municipio,
    totalCnes,
    internacoes,
    producaoUltimoMes: producaoMensal.at(-1)?.quantidadeAprovada ?? null,
    indicadoresAps,
  };
}

export default async function ComparadorPage() {
  const municipios = await getMunicipiosDisponiveis();
  const linhas = await Promise.all(municipios.map(buscarLinhaComparativa));
  const primeiraLinha = linhas[0];

  return (
    <PageShell
      sidebar={
        <AppSidebar
          municipioId={String(primeiraLinha?.municipio.municipioId ?? "")}
          alertCount={0}
          atualizacoes={[
            { fonte: "CNES", competencia: "dez/2025" },
            { fonte: "SISAB", competencia: "2024Q3" },
          ]}
          usuario={{ nome: "M. Cardoso", iniciais: "MC", orgao: "SMS" }}
        />
      }
    >
      <DashboardHeader
        kicker="Comparador de municípios"
        title="Municípios com dado real"
        subtitle={`${linhas.length} municípios carregados hoje (Rio de Janeiro, Paraty, Nova Iguaçu)`}
      />

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Resumo comparativo
        </span>
        <ResumoComparativoTable linhas={linhas} />
      </DashboardCard>

      <DashboardCard>
        <span className="text-sm font-semibold text-text-primary">
          Indicadores APS — Previne Brasil (2024Q3)
        </span>
        <IndicadoresComparativoTable linhas={linhas} />
        <p className="text-[11px] text-text-secondary">
          Comparação direta entre os 3 municípios com dado real carregado —
          não é um pareamento por população/região/porte de rede (ver
          notes/backlog.md).
        </p>
      </DashboardCard>

      <p className="text-center font-mono text-[10.5px] text-text-tertiary">
        FONTES: CNES · SIA · SIH · SISAB — DADOS REAIS (raio-x-engenharia)
      </p>
    </PageShell>
  );
}

function ResumoComparativoTable({ linhas }: { linhas: LinhaComparativa[] }) {
  return (
    <div className="flex flex-col">
      <div
        className="grid gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase"
        style={{ gridTemplateColumns: `2fr repeat(${linhas.length}, 1fr)` }}
      >
        <span>Indicador</span>
        {linhas.map(({ municipio }) => (
          <span key={municipio.municipioId} className="text-right">
            {municipio.nomeMunicipio}
          </span>
        ))}
      </div>

      <LinhaResumo
        rotulo="Unidades CNES"
        linhas={linhas}
        valor={(linha) => formatNumber(linha.totalCnes)}
      />
      <LinhaResumo
        rotulo="Internações (SIH)"
        linhas={linhas}
        valor={(linha) => formatNumber(linha.internacoes.total)}
      />
      <LinhaResumo
        rotulo="Permanência média (dias)"
        linhas={linhas}
        valor={(linha) =>
          linha.internacoes.permanenciaMediaDias === null
            ? "—"
            : String(linha.internacoes.permanenciaMediaDias)
        }
      />
      <LinhaResumo
        rotulo="Produção amb. (último mês)"
        linhas={linhas}
        valor={(linha) =>
          linha.producaoUltimoMes === null
            ? "—"
            : formatNumber(linha.producaoUltimoMes)
        }
        ultima
      />
    </div>
  );
}

function LinhaResumo({
  rotulo,
  linhas,
  valor,
  ultima = false,
}: {
  rotulo: string;
  linhas: LinhaComparativa[];
  valor: (linha: LinhaComparativa) => string;
  ultima?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-2 py-2 text-[12.5px] text-text-primary ${ultima ? "" : "border-b border-border-hairline"}`}
      style={{ gridTemplateColumns: `2fr repeat(${linhas.length}, 1fr)` }}
    >
      <span>{rotulo}</span>
      {linhas.map((linha) => (
        <span
          key={linha.municipio.municipioId}
          className="text-right font-display font-semibold"
        >
          {valor(linha)}
        </span>
      ))}
    </div>
  );
}

function IndicadoresComparativoTable({
  linhas,
}: {
  linhas: LinhaComparativa[];
}) {
  const indicadores = linhas[0]?.indicadoresAps ?? [];

  if (indicadores.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum indicador Previne Brasil carregado para estes municípios.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        className="grid gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase"
        style={{ gridTemplateColumns: `2.4fr repeat(${linhas.length}, 1fr)` }}
      >
        <span>Indicador</span>
        {linhas.map(({ municipio }) => (
          <span key={municipio.municipioId} className="text-right">
            {municipio.nomeMunicipio}
          </span>
        ))}
      </div>

      {indicadores.map((indicador, index) => (
        <div
          key={indicador.numeroIndicador}
          className={`grid items-center gap-2 py-2 text-[12.5px] text-text-primary ${
            index === indicadores.length - 1
              ? ""
              : "border-b border-border-hairline"
          }`}
          style={{ gridTemplateColumns: `2.4fr repeat(${linhas.length}, 1fr)` }}
        >
          <span>{indicador.descricaoIndicador}</span>
          {linhas.map((linha) => {
            const doMunicipio = linha.indicadoresAps.find(
              (item) => item.numeroIndicador === indicador.numeroIndicador,
            );
            return (
              <span
                key={linha.municipio.municipioId}
                className="text-right font-display font-semibold"
              >
                {doMunicipio ? formatPercent(doMunicipio.percentual, 0) : "—"}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
