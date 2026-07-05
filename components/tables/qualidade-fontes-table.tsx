import type { QualidadeFonte } from "@/types/qualidade-dados";
import { formatNumber } from "@/lib/formatters/number-format";

export type QualidadeFontesTableProps = {
  fontes: QualidadeFonte[];
};

export function QualidadeFontesTable({ fontes }: QualidadeFontesTableProps) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[0.8fr_1fr_1fr_2fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>Fonte</span>
        <span className="text-right">Registros</span>
        <span className="text-right">Municípios</span>
        <span>Período de referência</span>
      </div>
      {fontes.map((fonte) => (
        <div
          key={fonte.fonte}
          className="grid grid-cols-[0.8fr_1fr_1fr_2fr] items-center gap-2 border-b border-border-hairline py-2 text-[12.5px] text-text-primary last:border-0"
        >
          <span className="font-semibold">{fonte.fonte}</span>
          <span className="text-right font-display">
            {fonte.totalRegistrosAproximado ? "≈ " : ""}
            {formatNumber(fonte.totalRegistros)}
          </span>
          <span className="text-right">{fonte.municipiosCobertos}</span>
          <span className="text-text-secondary">{fonte.periodoReferencia}</span>
        </div>
      ))}
    </div>
  );
}
