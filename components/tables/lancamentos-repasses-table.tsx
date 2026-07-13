import { formatCurrency } from "@/lib/formatters/currency-format";
import type { FonteRepasse, LancamentoRepasse } from "@/types/financiamento";

const ROTULO_FONTE: Record<FonteRepasse, string> = {
  fns_fundo_a_fundo: "FNS · Fundo a Fundo",
  portal_transparencia: "Portal da Transparência",
};

export type LancamentosRepassesTableProps = {
  lancamentos: LancamentoRepasse[];
};

export function LancamentosRepassesTable({
  lancamentos,
}: LancamentosRepassesTableProps) {
  if (lancamentos.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Nenhum lançamento de repasse federal carregado para este município.
      </p>
    );
  }

  return (
    <div className="flex flex-col overflow-x-auto">
      <div className="grid min-w-max grid-cols-[0.8fr_1.3fr_0.7fr_2fr_1fr] gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase">
        <span>Data</span>
        <span>Fonte</span>
        <span>Tipo</span>
        <span>Descrição</span>
        <span className="text-right">Valor</span>
      </div>
      {lancamentos.map((lancamento, index) => (
        <div
          key={`${lancamento.dataFormatada}-${index}`}
          className="grid min-w-max grid-cols-[0.8fr_1.3fr_0.7fr_2fr_1fr] items-center gap-2 border-b border-border-hairline py-2 text-[12.5px] text-text-primary last:border-0"
        >
          <span className="text-text-secondary">{lancamento.dataFormatada}</span>
          <span>{ROTULO_FONTE[lancamento.fonte]}</span>
          <span
            className={
              lancamento.tipoLancamento === "credito" ? "text-success" : "text-danger"
            }
          >
            {lancamento.tipoLancamento === "credito" ? "Crédito" : "Débito"}
          </span>
          <span className="text-text-secondary">{lancamento.descricaoOrigem}</span>
          <span className="text-right font-display font-semibold">
            {formatCurrency(lancamento.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}
