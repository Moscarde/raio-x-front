import type { ProducaoPorGrupo } from "@/types/producao-ambulatorial";
import { formatCurrency } from "@/lib/formatters/currency-format";

export type ProducaoPorGrupoBarsProps = {
  itens: ProducaoPorGrupo[];
};

export function ProducaoPorGrupoBars({ itens }: ProducaoPorGrupoBarsProps) {
  if (itens.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Produção ambulatorial ainda não disponível para este município.
      </p>
    );
  }

  const maiorValor = Math.max(...itens.map((item) => item.valorAprovado));

  return (
    <div className="flex flex-col gap-2.5">
      {itens.map((item) => (
        <div key={item.grupoProcedimento} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs text-text-primary">
            <span className="font-mono">
              Grupo {item.grupoProcedimento} (SIGTAP)
            </span>
            <span className="font-display font-semibold">
              {formatCurrency(item.valorAprovado)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-brand-secondary"
              style={{ width: `${(item.valorAprovado / maiorValor) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
