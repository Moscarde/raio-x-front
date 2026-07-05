import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type { IndicadorAps } from "@/types/indicador-aps";

type IndicadorApsRow = {
  numero_indicador: number;
  descricao_indicador: string;
  percentual: string;
  percentual_quadrimestre: string;
  populacao: string;
  quadrimestre: string;
};

export function mapRowToIndicadorAps(row: IndicadorApsRow): IndicadorAps {
  return {
    numeroIndicador: row.numero_indicador,
    descricaoIndicador: row.descricao_indicador,
    percentual: parseNumericColumn(row.percentual),
    percentualQuadrimestre: parseNumericColumn(row.percentual_quadrimestre),
    populacaoCoberta: parseNumericColumn(row.populacao),
    quadrimestre: row.quadrimestre,
  };
}

/**
 * "validas" é a visão de equipe usada oficialmente para o cálculo de
 * financiamento do Previne Brasil (ver stg_sisab__indicador_desempenho) —
 * "geral" e "homologadas" existem na mesma mart mas não são o número
 * usado para pagamento.
 */
export async function getIndicadoresAps(
  municipioId: number,
): Promise<IndicadorAps[]> {
  const rows = await query<IndicadorApsRow>(
    `select numero_indicador, descricao_indicador, percentual, percentual_quadrimestre, populacao, quadrimestre
     from marts.mart_indicadores_aps
     where id_municipio = $1
       and visao_equipe = 'validas'
     order by numero_indicador`,
    [municipioId],
  );
  return rows.map(mapRowToIndicadorAps);
}
