import { query } from "@/lib/db/postgres";
import { parseNumericColumn, parseNullableNumericColumn } from "@/lib/db/numeric";
import type { IndicadorIcsap, ResumoInternacoes } from "@/types/internacao";

type ResumoInternacoesRow = {
  total: string;
  permanencia_media: string | null;
};

type IndicadorIcsapRow = {
  ano: number;
  total_internacoes: string;
  total_internacoes_icsap: string;
  percentual_icsap: string;
};

export function mapRowToResumoInternacoes(
  row: ResumoInternacoesRow,
): ResumoInternacoes {
  return {
    total: parseNumericColumn(row.total),
    permanenciaMediaDias: parseNullableNumericColumn(row.permanencia_media),
  };
}

export async function getResumoInternacoes(
  municipioId: number,
): Promise<ResumoInternacoes> {
  const rows = await query<ResumoInternacoesRow>(
    `select count(*) as total, round(avg(dias_permanencia), 1) as permanencia_media
     from marts.fct_internacoes
     where id_municipio_estabelecimento = $1`,
    [municipioId],
  );
  return mapRowToResumoInternacoes(
    rows[0] ?? { total: "0", permanencia_media: null },
  );
}

export function mapRowToIndicadorIcsap(row: IndicadorIcsapRow): IndicadorIcsap {
  return {
    ano: row.ano,
    totalInternacoes: parseNumericColumn(row.total_internacoes),
    totalInternacoesIcsap: parseNumericColumn(row.total_internacoes_icsap),
    percentualIcsap: parseNumericColumn(row.percentual_icsap),
  };
}

/**
 * Grão é município de RESIDÊNCIA do paciente × ano, diferente de
 * getResumoInternacoes (município do ESTABELECIMENTO). Denominador é
 * todo o total de internações, não só "internações clínicas" da
 * metodologia ICSAP oficial completa (SIH não distingue complexidade/
 * motivo de saída ainda) — replicar essa ressalva perto de onde o
 * percentual aparecer na UI.
 */
export async function getIcsapMunicipio(
  municipioId: number,
): Promise<IndicadorIcsap | null> {
  const rows = await query<IndicadorIcsapRow>(
    `select ano, total_internacoes, total_internacoes_icsap, percentual_icsap
     from marts.mart_icsap_municipio
     where id_municipio = $1
     order by ano desc
     limit 1`,
    [municipioId],
  );
  return rows[0] ? mapRowToIndicadorIcsap(rows[0]) : null;
}
