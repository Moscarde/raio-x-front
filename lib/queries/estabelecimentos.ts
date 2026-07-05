import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type { EstabelecimentoPorTipo } from "@/types/estabelecimento";

type EstabelecimentoPorTipoRow = {
  tipo: string;
  total: string;
};

export function mapRowToEstabelecimentoPorTipo(
  row: EstabelecimentoPorTipoRow,
): EstabelecimentoPorTipo {
  return {
    tipoUnidade: row.tipo,
    total: parseNumericColumn(row.total),
  };
}

export async function getTotalEstabelecimentosCnes(
  municipioId: number,
): Promise<number> {
  const rows = await query<{ total: string }>(
    `select count(*) as total
     from marts.dim_estabelecimento
     where id_municipio = $1`,
    [municipioId],
  );
  return parseNumericColumn(rows[0]?.total ?? "0");
}

export async function getEstabelecimentosPorTipo(
  municipioId: number,
  limite = 6,
): Promise<EstabelecimentoPorTipo[]> {
  const rows = await query<EstabelecimentoPorTipoRow>(
    `select
       coalesce(descricao_tipo_unidade, 'Código ' || codigo_tipo_unidade) as tipo,
       count(*) as total
     from marts.dim_estabelecimento
     where id_municipio = $1
     group by 1
     order by total desc
     limit $2`,
    [municipioId, limite],
  );
  return rows.map(mapRowToEstabelecimentoPorTipo);
}
