import { unstable_cache } from "next/cache";
import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import { formatNumber } from "@/lib/formatters/number-format";
import { formatPercent } from "@/lib/formatters/percent-format";
import type {
  CriterioPareamento,
  DestaqueComparativo,
  LinhaComparativa,
  MunicipioComparacaoRj,
  PosicaoRanking,
  ValorIndicadorComparativo,
} from "@/types/comparacao-municipio";
import type { CoberturaApsMunicipio } from "@/types/cobertura-aps";
import type { IndicadorIcsap } from "@/types/internacao";

const LIMITE_PARES_PADRAO = 5;

type MunicipioComparacaoRjRow = {
  id_municipio: number;
  nome_municipio: string;
  nome_microrregiao: string;
  populacao_estimada: string;
  estabelecimentos_por_10k_habitantes: string;
  producao_2025: string;
  municipio_referencia: boolean;
};

export function mapRowToMunicipioComparacaoRj(
  row: MunicipioComparacaoRjRow,
): MunicipioComparacaoRj {
  const populacaoEstimada = parseNumericColumn(row.populacao_estimada);
  const producao2025 = parseNumericColumn(row.producao_2025);
  return {
    municipioId: row.id_municipio,
    nomeMunicipio: row.nome_municipio,
    nomeMicrorregiao: row.nome_microrregiao,
    populacaoEstimada,
    estabelecimentosPor10kHabitantes: parseNumericColumn(
      row.estabelecimentos_por_10k_habitantes,
    ),
    producaoPorMilHabitantes:
      populacaoEstimada > 0 ? (producao2025 / populacaoEstimada) * 1000 : 0,
    municipioReferencia: row.municipio_referencia,
  };
}

/**
 * mart_producao_grupo_municipio cobre o estado inteiro do RJ (SIA mudou de
 * escopo em 2026-07-04, ver ROADMAP.md do raio-x-engenharia) — por isso dá
 * pra calcular produção per capita pros 92 municípios, não só os 3 de
 * referência.
 */
async function buscarMunicipiosComparacaoRj(): Promise<
  MunicipioComparacaoRj[]
> {
  const rows = await query<MunicipioComparacaoRjRow>(`
    with producao_anual as (
      select id_municipio, sum(quantidade_aprovada) as producao_2025
      from marts.mart_producao_grupo_municipio
      where competencia_date >= '2025-01-01' and competencia_date < '2026-01-01'
      group by id_municipio
    )
    select c.id_municipio, c.nome_municipio, d.nome_microrregiao, c.populacao_estimada,
           c.estabelecimentos_por_10k_habitantes, c.municipio_referencia,
           coalesce(p.producao_2025, 0) as producao_2025
    from marts.mart_comparacao_municipios_rj c
    join marts.dim_municipio d on d.id_municipio = c.id_municipio
    left join producao_anual p on p.id_municipio = c.id_municipio
    order by c.nome_municipio
  `);
  return rows.map(mapRowToMunicipioComparacaoRj);
}

export const getMunicipiosComparacaoRj = unstable_cache(
  buscarMunicipiosComparacaoRj,
  ["municipios-comparacao-rj"],
  { revalidate: 3600 },
);

/**
 * Pareamento por região usa mesma microrregião IBGE, sem alvo. Por
 * população/porte de rede usa distância absoluta ao alvo — não há critério
 * de faixa/cluster oficial na mart, então "mais próximo" é a aproximação
 * mais simples que ainda é defensável.
 */
export function selecionarPares(
  alvo: MunicipioComparacaoRj,
  todos: MunicipioComparacaoRj[],
  criterio: CriterioPareamento,
  limite: number = LIMITE_PARES_PADRAO,
): MunicipioComparacaoRj[] {
  const outros = todos.filter((m) => m.municipioId !== alvo.municipioId);

  if (criterio === "regiao") {
    return outros
      .filter((m) => m.nomeMicrorregiao === alvo.nomeMicrorregiao)
      .sort((a, b) => b.populacaoEstimada - a.populacaoEstimada)
      .slice(0, limite);
  }

  const distancia = (m: MunicipioComparacaoRj): number =>
    criterio === "populacao"
      ? Math.abs(m.populacaoEstimada - alvo.populacaoEstimada)
      : Math.abs(
          m.estabelecimentosPor10kHabitantes -
            alvo.estabelecimentosPor10kHabitantes,
        );

  return [...outros].sort((a, b) => distancia(a) - distancia(b)).slice(0, limite);
}

export function calcularPosicao(
  valores: ValorIndicadorComparativo[],
  maiorMelhor: boolean,
  municipioId: number,
): PosicaoRanking | null {
  const comValor = valores.filter(
    (v): v is ValorIndicadorComparativo & { valor: number } => v.valor !== null,
  );
  if (comValor.length === 0) {
    return null;
  }

  const ordenado = [...comValor].sort((a, b) =>
    maiorMelhor ? b.valor - a.valor : a.valor - b.valor,
  );
  const indice = ordenado.findIndex((v) => v.municipioId === municipioId);
  return indice === -1 ? null : { posicao: indice + 1, total: ordenado.length };
}

function valorFormatadoOuTraco(
  valor: number | null,
  formatar: (v: number) => string,
): string {
  return valor === null ? "—" : formatar(valor);
}

function linhaPopulacao(municipios: MunicipioComparacaoRj[]): LinhaComparativa {
  return {
    chave: "populacao",
    rotulo: "População estimada",
    maiorMelhor: true,
    valores: municipios.map((m) => ({
      municipioId: m.municipioId,
      valor: m.populacaoEstimada,
      valorFormatado: formatNumber(m.populacaoEstimada),
    })),
  };
}

function linhaPorteRede(municipios: MunicipioComparacaoRj[]): LinhaComparativa {
  return {
    chave: "porte_rede",
    rotulo: "Porte de rede (estab./10k hab.)",
    maiorMelhor: true,
    valores: municipios.map((m) => ({
      municipioId: m.municipioId,
      valor: m.estabelecimentosPor10kHabitantes,
      valorFormatado: m.estabelecimentosPor10kHabitantes.toFixed(1),
    })),
  };
}

function linhaProducaoPerCapita(
  municipios: MunicipioComparacaoRj[],
): LinhaComparativa {
  return {
    chave: "producao_per_capita",
    rotulo: "Produção amb. (por mil hab., 2025)",
    maiorMelhor: true,
    valores: municipios.map((m) => ({
      municipioId: m.municipioId,
      valor: m.producaoPorMilHabitantes,
      valorFormatado: formatNumber(Math.round(m.producaoPorMilHabitantes)),
    })),
  };
}

function linhaCoberturaEsf(
  municipios: MunicipioComparacaoRj[],
  coberturaPorMunicipio: Map<number, CoberturaApsMunicipio | null>,
): LinhaComparativa {
  return {
    chave: "cobertura_esf",
    rotulo: "Cobertura APS (ESF)",
    maiorMelhor: true,
    valores: municipios.map((m) => {
      const valor =
        coberturaPorMunicipio.get(m.municipioId)?.percentualCoberturaEsf ?? null;
      return {
        municipioId: m.municipioId,
        valor,
        valorFormatado: valorFormatadoOuTraco(valor, (v) => formatPercent(v, 1)),
      };
    }),
  };
}

function linhaIcsap(
  municipios: MunicipioComparacaoRj[],
  icsapPorMunicipio: Map<number, IndicadorIcsap | null>,
): LinhaComparativa {
  return {
    chave: "icsap",
    rotulo: "Internações ICSAP (%)",
    maiorMelhor: false,
    valores: municipios.map((m) => {
      const valor = icsapPorMunicipio.get(m.municipioId)?.percentualIcsap ?? null;
      return {
        municipioId: m.municipioId,
        valor,
        valorFormatado: valorFormatadoOuTraco(valor, (v) => formatPercent(v, 1)),
      };
    }),
  };
}

export function montarLinhasComparativas(
  municipios: MunicipioComparacaoRj[],
  coberturaPorMunicipio: Map<number, CoberturaApsMunicipio | null>,
  icsapPorMunicipio: Map<number, IndicadorIcsap | null>,
): LinhaComparativa[] {
  return [
    linhaPopulacao(municipios),
    linhaPorteRede(municipios),
    linhaProducaoPerCapita(municipios),
    linhaCoberturaEsf(municipios, coberturaPorMunicipio),
    linhaIcsap(municipios, icsapPorMunicipio),
  ];
}

function calcularDesvioAlvo(
  linha: LinhaComparativa,
  alvoId: number,
): DestaqueComparativo | null {
  const alvoValor = linha.valores.find((v) => v.municipioId === alvoId)?.valor;
  if (alvoValor === null || alvoValor === undefined) {
    return null;
  }

  const paresComValor = linha.valores.filter(
    (v): v is ValorIndicadorComparativo & { valor: number } =>
      v.municipioId !== alvoId && v.valor !== null,
  );
  if (paresComValor.length === 0) {
    return null;
  }

  const mediaPares =
    paresComValor.reduce((soma, v) => soma + v.valor, 0) / paresComValor.length;
  if (mediaPares === 0) {
    return null;
  }

  const desvioBruto = ((alvoValor - mediaPares) / mediaPares) * 100;
  return {
    rotulo: linha.rotulo,
    percentualVsPares: linha.maiorMelhor ? desvioBruto : -desvioBruto,
  };
}

/**
 * "Ponto forte"/"ponto fraco" comparam o alvo contra a MÉDIA DOS PARES (não
 * contra os 92 municípios), já orientados por maiorMelhor — um percentual
 * positivo é sempre bom, negativo é sempre ruim, mesmo pra ICSAP (invertido
 * porque menor é melhor). População fica de fora: é contexto, não
 * desempenho.
 */
export function calcularDestaques(
  linhas: LinhaComparativa[],
  alvoId: number,
): {
  pontoForte: DestaqueComparativo | null;
  pontoFraco: DestaqueComparativo | null;
} {
  const candidatos = linhas
    .filter((linha) => linha.chave !== "populacao")
    .map((linha) => calcularDesvioAlvo(linha, alvoId))
    .filter((item): item is DestaqueComparativo => item !== null);

  if (candidatos.length === 0) {
    return { pontoForte: null, pontoFraco: null };
  }

  const ordenado = [...candidatos].sort(
    (a, b) => b.percentualVsPares - a.percentualVsPares,
  );
  return {
    pontoForte: ordenado[0],
    pontoFraco: candidatos.length > 1 ? (ordenado.at(-1) ?? null) : null,
  };
}
