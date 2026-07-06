import { unstable_cache } from "next/cache";
import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import { formatCompetencia } from "@/lib/formatters/competencia-format";
import type {
  ProducaoMensalPoint,
  ProducaoPorGrupo,
} from "@/types/producao-ambulatorial";

const MESES_JANELA = 12;
const GRUPOS_JANELA = 10;

type ProducaoMensalRow = {
  competencia_arquivo: string;
  quantidade_aprovada: string;
};

type PontoSemMedia = Omit<ProducaoMensalPoint, "media12m">;

function mapRowParaPonto(row: ProducaoMensalRow): PontoSemMedia | null {
  try {
    return {
      competencia: row.competencia_arquivo,
      competenciaLabel: formatCompetencia(row.competencia_arquivo),
      quantidadeAprovada: parseNumericColumn(row.quantidade_aprovada),
    };
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "producao_ambulatorial_competencia_invalida",
        competencia_arquivo: row.competencia_arquivo,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return null;
  }
}

/**
 * Uma linha com competencia_arquivo malformada não pode derrubar a página
 * inteira (KPIs, alertas, tabelas) por causa só da produção mensal — a
 * linha é descartada e logada em vez de propagar a exceção do
 * formatCompetencia.
 */
export function mapRowsToProducaoMensal(
  rows: ProducaoMensalRow[],
): ProducaoMensalPoint[] {
  const pontos = rows
    .map(mapRowParaPonto)
    .filter((ponto): ponto is PontoSemMedia => ponto !== null);

  const media12m =
    pontos.reduce((soma, ponto) => soma + ponto.quantidadeAprovada, 0) /
    (pontos.length || 1);

  return pontos.map((ponto) => ({ ...ponto, media12m }));
}

/**
 * marts.mart_producao_ambulatorial_mensal_municipio já vem pré-agregada no
 * dbt para evitar varrer fct_producao_ambulatorial (99,9M+ linhas) em tempo
 * de request no frontend.
 *
 * `limit 12` no subselect garante uma janela móvel dos últimos 12 meses —
 * sem isso, a média cresceria diluída conforme mais competências forem
 * carregadas, e o rótulo "últimos 12 meses" da tela deixaria de ser real.
 */
async function buscarProducaoMensal(
  municipioId: number,
): Promise<ProducaoMensalPoint[]> {
  const rows = await query<ProducaoMensalRow>(
    `select competencia_arquivo, quantidade_aprovada
     from (
       select competencia_arquivo, quantidade_aprovada
       from marts.mart_producao_ambulatorial_mensal_municipio
       where id_municipio = $1
       order by competencia_arquivo desc
       limit $2
      ) as ultimos_meses
      order by competencia_arquivo asc`,
    [municipioId, MESES_JANELA],
  );
  return mapRowsToProducaoMensal(rows);
}

export const getProducaoMensal = unstable_cache(
  buscarProducaoMensal,
  ["producao-mensal-por-municipio"],
  { revalidate: 60 * 60 * 24 },
);

export async function getProducaoMensalOrEmpty(
  municipioId: number,
): Promise<ProducaoMensalPoint[]> {
  try {
    return await getProducaoMensal(municipioId);
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "producao_mensal_query_failed",
        municipioId,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return [];
  }
}

type ProducaoPorGrupoRow = {
  grupo: string;
  quantidade_aprovada: string;
  valor_aprovado: string;
};

export function mapRowToProducaoPorGrupo(
  row: ProducaoPorGrupoRow,
): ProducaoPorGrupo {
  return {
    grupoProcedimento: row.grupo,
    quantidadeAprovada: parseNumericColumn(row.quantidade_aprovada),
    valorAprovado: parseNumericColumn(row.valor_aprovado),
  };
}

/**
 * Mesma tabela de 99,9M+ linhas de buscarProducaoMensal (~5,8s medido) —
 * cacheada pelo mesmo motivo. Os 2 primeiros dígitos do código SIGTAP
 * identificam o grupo de procedimento; não há seed de-para para nome
 * legível ainda (ver notes/backlog.md).
 */
async function buscarProducaoPorGrupo(
  municipioId: number,
): Promise<ProducaoPorGrupo[]> {
  const rows = await query<ProducaoPorGrupoRow>(
    `select
       left(codigo_procedimento, 2) as grupo,
       sum(quantidade_aprovada) as quantidade_aprovada,
       sum(valor_aprovado) as valor_aprovado
     from marts.fct_producao_ambulatorial
     where id_municipio_estabelecimento = $1
     group by 1
     order by valor_aprovado desc
     limit $2`,
    [municipioId, GRUPOS_JANELA],
  );
  return rows.map(mapRowToProducaoPorGrupo);
}

export const getProducaoPorGrupo = unstable_cache(
  buscarProducaoPorGrupo,
  ["producao-por-grupo-por-municipio"],
  { revalidate: 60 * 60 * 24 },
);
