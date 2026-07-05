import type { EstabelecimentoPorTipo } from "@/types/estabelecimento";

export type RedeInstaladaBarsProps = {
  itens: EstabelecimentoPorTipo[];
};

export function RedeInstaladaBars({ itens }: RedeInstaladaBarsProps) {
  if (itens.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum estabelecimento CNES cadastrado para este município.
      </p>
    );
  }

  const maiorTotal = Math.max(...itens.map((item) => item.total));

  return (
    <div className="flex flex-col gap-2.5">
      {itens.map((item) => (
        <div key={item.tipoUnidade} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs text-text-primary">
            <span>{item.tipoUnidade}</span>
            <span className="font-display font-semibold">{item.total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-brand-primary"
              style={{ width: `${(item.total / maiorTotal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
