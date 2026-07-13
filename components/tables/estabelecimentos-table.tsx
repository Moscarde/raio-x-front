import type { EstabelecimentoDetalhe } from "@/types/estabelecimento";

export type EstabelecimentosTableProps = {
  estabelecimentos: EstabelecimentoDetalhe[];
};

export function EstabelecimentosTable({
  estabelecimentos,
}: EstabelecimentosTableProps) {
  if (estabelecimentos.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum estabelecimento cadastrado para este município.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[0.8fr_1.5fr_1.4fr_1.6fr_1fr_0.8fr_0.8fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>CNES</span>
        <span>Unidade</span>
        <span>Tipo de unidade</span>
        <span>Endereço</span>
        <span>Natureza jurídica</span>
        <span>Gestão</span>
        <span>Vínculo SUS</span>
      </div>
      <div className="max-h-105 overflow-y-auto">
        {estabelecimentos.map((estabelecimento) => (
          <div
            key={estabelecimento.codigoCnes}
            className="grid grid-cols-[0.8fr_1.5fr_1.4fr_1.6fr_1fr_0.8fr_0.8fr] items-center gap-2 border-b border-border-hairline py-2 text-[12px] text-text-primary last:border-0"
          >
            <span className="font-mono">{estabelecimento.codigoCnes}</span>
            <span>{estabelecimento.nomeFantasia ?? "—"}</span>
            <span>{estabelecimento.tipoUnidade}</span>
            <span>
              {[estabelecimento.endereco, estabelecimento.bairro]
                .filter(Boolean)
                .join(" · ") || "—"}
            </span>
            <span>{estabelecimento.naturezaJuridica}</span>
            <span>{estabelecimento.tipoGestao ?? "—"}</span>
            <span>{estabelecimento.temVinculoSus ? "Sim" : "Não"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
