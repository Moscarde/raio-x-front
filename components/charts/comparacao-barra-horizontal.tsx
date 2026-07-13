export type PontoComparacaoBarra = {
  municipioId: number;
  nomeMunicipio: string;
  valor: number;
  valorFormatado: string;
};

export type ComparacaoBarraHorizontalProps = {
  pontos: PontoComparacaoBarra[];
  alvoId: number;
  maiorMelhor: boolean;
};

const LIMIAR_OUTLIER_PERCENTUAL = 50;

export function ComparacaoBarraHorizontal({
  pontos,
  alvoId,
  maiorMelhor,
}: ComparacaoBarraHorizontalProps) {
  if (pontos.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Dado insuficiente para comparar este indicador.
      </p>
    );
  }

  const maiorValor = Math.max(...pontos.map((p) => p.valor), 1);
  const notaOutlier = descreverOutlierAlvo(pontos, alvoId);

  return (
    <div className="flex flex-col gap-2.5">
      {pontos.map((ponto) => (
        <div key={ponto.municipioId} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs text-text-primary">
            <span className={ponto.municipioId === alvoId ? "font-semibold" : ""}>
              {ponto.nomeMunicipio}
            </span>
            <span className="font-display font-semibold">
              {ponto.valorFormatado}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border">
            <div
              className={corBarra(ponto, pontos, alvoId, maiorMelhor)}
              style={{ width: `${(ponto.valor / maiorValor) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {notaOutlier ? (
        <p className="text-[11px] text-text-secondary">{notaOutlier}</p>
      ) : null}
    </div>
  );
}

function corBarra(
  ponto: PontoComparacaoBarra,
  todos: PontoComparacaoBarra[],
  alvoId: number,
  maiorMelhor: boolean,
): string {
  if (ponto.municipioId !== alvoId) {
    return "h-full rounded-full bg-text-tertiary/40";
  }
  const mediaOutros = mediaValores(todos.filter((p) => p.municipioId !== alvoId));
  if (mediaOutros === null) {
    return "h-full rounded-full bg-brand-primary";
  }
  const acimaDaMedia = ponto.valor >= mediaOutros;
  const bom = maiorMelhor ? acimaDaMedia : !acimaDaMedia;
  return bom ? "h-full rounded-full bg-success" : "h-full rounded-full bg-danger";
}

function mediaValores(pontos: PontoComparacaoBarra[]): number | null {
  if (pontos.length === 0) {
    return null;
  }
  return pontos.reduce((soma, p) => soma + p.valor, 0) / pontos.length;
}

function descreverOutlierAlvo(
  pontos: PontoComparacaoBarra[],
  alvoId: number,
): string | null {
  const alvo = pontos.find((p) => p.municipioId === alvoId);
  const outros = pontos.filter((p) => p.municipioId !== alvoId);
  const mediaOutros = mediaValores(outros);
  if (!alvo || mediaOutros === null || mediaOutros === 0) {
    return null;
  }

  const desvioPercentual = ((alvo.valor - mediaOutros) / mediaOutros) * 100;
  if (Math.abs(desvioPercentual) < LIMIAR_OUTLIER_PERCENTUAL) {
    return null;
  }

  const direcao = desvioPercentual > 0 ? "acima" : "abaixo";
  return `${alvo.nomeMunicipio} está ${Math.abs(Math.round(desvioPercentual))}% ${direcao} da média dos municípios comparados.`;
}
