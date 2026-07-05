import { query } from "@/lib/db/postgres";
import { parseNumericColumn, parseNullableNumericColumn } from "@/lib/db/numeric";
import type { ResumoInternacoes } from "@/types/internacao";

type ResumoInternacoesRow = {
  total: string;
  permanencia_media: string | null;
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
