import type { UnidadePossivelmenteEncerrada } from "@/types/estabelecimento";

export type UnidadesEncerradasTableProps = {
  unidades: UnidadePossivelmenteEncerrada[];
};

export function UnidadesEncerradasTable({
  unidades,
}: UnidadesEncerradasTableProps) {
  if (unidades.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhuma unidade possivelmente encerrada na série CNES carregada.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[0.9fr_1.8fr_1.6fr_1fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>CNES</span>
        <span>Unidade</span>
        <span>Tipo</span>
        <span>Última presença</span>
      </div>
      {unidades.map((unidade) => (
        <div
          key={unidade.codigoCnes}
          className="grid grid-cols-[0.9fr_1.8fr_1.6fr_1fr] items-center gap-2 border-b border-border-hairline py-2 text-[12px] text-text-primary last:border-0"
        >
          <span className="font-mono">{unidade.codigoCnes}</span>
          <span>{unidade.nomeFantasia ?? "—"}</span>
          <span>{unidade.tipoUnidade ?? "—"}</span>
          <span>{unidade.ultimaCompetenciaObservada}</span>
        </div>
      ))}
    </div>
  );
}
