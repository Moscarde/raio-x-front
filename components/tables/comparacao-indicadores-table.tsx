import { StatusBadge, type StatusSeverity } from "@/components/alerts/status-badge";
import { calcularPosicao } from "@/lib/queries/comparacao-municipios";
import type {
  LinhaComparativa,
  MunicipioComparacaoRj,
} from "@/types/comparacao-municipio";

export type ComparacaoIndicadoresTableProps = {
  municipios: MunicipioComparacaoRj[];
  linhas: LinhaComparativa[];
  alvoId: number;
};

export function ComparacaoIndicadoresTable({
  municipios,
  linhas,
  alvoId,
}: ComparacaoIndicadoresTableProps) {
  const colunas = `2.2fr repeat(${municipios.length}, 1fr) 1fr`;

  return (
    <div className="flex flex-col overflow-x-auto">
      <div
        className="grid min-w-max gap-2 border-b border-border-hairline pb-2 font-mono text-[10px] font-semibold tracking-wide text-text-tertiary uppercase"
        style={{ gridTemplateColumns: colunas }}
      >
        <span>Indicador</span>
        {municipios.map((municipio) => (
          <span key={municipio.municipioId} className="text-right">
            {municipio.nomeMunicipio}
          </span>
        ))}
        <span className="text-right">Posição</span>
      </div>

      {linhas.map((linha, index) => (
        <LinhaTabela
          key={linha.chave}
          linha={linha}
          municipios={municipios}
          alvoId={alvoId}
          colunas={colunas}
          ultima={index === linhas.length - 1}
        />
      ))}
    </div>
  );
}

type LinhaTabelaProps = {
  linha: LinhaComparativa;
  municipios: MunicipioComparacaoRj[];
  alvoId: number;
  colunas: string;
  ultima: boolean;
};

function LinhaTabela({ linha, municipios, alvoId, colunas, ultima }: LinhaTabelaProps) {
  const posicao = calcularPosicao(linha.valores, linha.maiorMelhor, alvoId);

  return (
    <div
      className={`grid min-w-max items-center gap-2 py-2 text-[12.5px] text-text-primary ${ultima ? "" : "border-b border-border-hairline"}`}
      style={{ gridTemplateColumns: colunas }}
    >
      <span>{linha.rotulo}</span>
      {municipios.map((municipio) => {
        const valor = linha.valores.find((v) => v.municipioId === municipio.municipioId);
        return (
          <span
            key={municipio.municipioId}
            className={`text-right font-display ${municipio.municipioId === alvoId ? "font-bold text-brand-primary" : "font-semibold"}`}
          >
            {valor?.valorFormatado ?? "—"}
          </span>
        );
      })}
      <span className="flex justify-end">
        {posicao ? (
          <StatusBadge
            status={severidadePosicao(posicao.posicao, posicao.total)}
            label={`${posicao.posicao}º de ${posicao.total}`}
          />
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </span>
    </div>
  );
}

function severidadePosicao(posicao: number, total: number): StatusSeverity {
  const percentil = posicao / total;
  if (percentil <= 1 / 3) {
    return "sucesso";
  }
  if (percentil <= 2 / 3) {
    return "atencao";
  }
  return "critico";
}
