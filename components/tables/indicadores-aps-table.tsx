import type { IndicadorAps } from "@/types/indicador-aps";
import { formatPercent } from "@/lib/formatters/percent-format";
import { StatusBadge, type StatusSeverity } from "@/components/alerts/status-badge";

export type IndicadoresApsTableProps = {
  indicadores: IndicadorAps[];
};

export function IndicadoresApsTable({ indicadores }: IndicadoresApsTableProps) {
  if (indicadores.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum indicador Previne Brasil carregado para este município.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[2.4fr_0.8fr_0.8fr_1fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>Indicador</span>
        <span className="text-right">Resultado do quadrimestre</span>
        <span className="text-right">Meta</span>
        <span className="text-right">Status</span>
      </div>
      {indicadores.map((indicador) => (
        <div
          key={indicador.numeroIndicador}
          className="grid grid-cols-[2.4fr_0.8fr_0.8fr_1fr] items-center gap-2 border-b border-border-hairline py-2 text-[12.5px] text-text-primary last:border-0"
        >
          <span>{indicador.descricaoIndicador}</span>
          <span className="text-right font-display text-sm font-semibold">
            {formatPercent(indicador.percentualQuadrimestre, 0)}
          </span>
          <span className="text-right">
            {indicador.metaPercentual === null
              ? "—"
              : formatPercent(indicador.metaPercentual, 0)}
          </span>
          <span className="justify-self-end">
            {indicador.statusMeta ? (
              <StatusBadge
                status={getStatusSeverity(indicador.statusMeta)}
                label={getStatusLabel(indicador.statusMeta)}
              />
            ) : (
              "—"
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function getStatusSeverity(status: IndicadorAps["statusMeta"]): StatusSeverity {
  if (status === "ok") {
    return "sucesso";
  }

  return status ?? "atencao";
}

function getStatusLabel(status: NonNullable<IndicadorAps["statusMeta"]>): string {
  return status === "ok"
    ? "Parâmetro ideal atingido"
    : status === "atencao"
      ? "Meta atingida, abaixo do ideal"
      : "Meta não atingida";
}
