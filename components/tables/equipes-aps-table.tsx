import type { EquipeApsDetalhada } from "@/types/equipe-aps";

export type EquipesApsTableProps = {
  equipes: EquipeApsDetalhada[];
};

export function EquipesApsTable({ equipes }: EquipesApsTableProps) {
  if (equipes.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhuma equipe APS carregada para este município.
      </p>
    );
  }

  return (
    <div className="max-h-105 overflow-y-auto">
      <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>Equipe</span>
        <span>Unidade</span>
        <span>Território</span>
        <span>CNES</span>
        <span>Situação</span>
      </div>
      {equipes.map((equipe) => (
        <div
          key={equipe.equipeId}
          className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-2 border-b border-border-hairline py-2 text-[12px] text-text-primary last:border-0"
        >
          <span>{equipe.nome ?? equipe.sigla ?? "—"}</span>
          <span>{equipe.nomeUnidade ?? equipe.tipoUnidade ?? "—"}</span>
          <span>{equipe.nomeArea ?? equipe.descricaoSegmento ?? "—"}</span>
          <span className="font-mono">{equipe.codigoCnes}</span>
          <span>{equipe.situacao ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}
