import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type {
  EstabelecimentoDetalhe,
  EstabelecimentoPorTipo,
  ResumoRede,
} from "@/types/estabelecimento";

type EstabelecimentoPorTipoRow = {
  tipo: string;
  total: string;
};

type EstabelecimentoDetalheRow = {
  codigo_cnes: string;
  tipo_unidade: string;
  natureza_juridica: string;
  tipo_gestao: string | null;
  tem_vinculo_sus: boolean;
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

export async function getResumoRede(municipioId: number): Promise<ResumoRede> {
  const rows = await query<{
    total_estabelecimentos: string;
    com_vinculo_sus: string;
    tipos_distintos: string;
  }>(
    `select
       count(*) as total_estabelecimentos,
       sum(case when tem_vinculo_sus then 1 else 0 end) as com_vinculo_sus,
       count(distinct codigo_tipo_unidade) as tipos_distintos
     from marts.dim_estabelecimento
     where id_municipio = $1`,
    [municipioId],
  );
  const row = rows[0];
  return {
    totalEstabelecimentos: parseNumericColumn(row?.total_estabelecimentos ?? "0"),
    comVinculoSus: parseNumericColumn(row?.com_vinculo_sus ?? "0"),
    tiposDistintos: parseNumericColumn(row?.tipos_distintos ?? "0"),
  };
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

export async function getEstabelecimentosPorNaturezaJuridica(
  municipioId: number,
  limite = 8,
): Promise<EstabelecimentoPorTipo[]> {
  const rows = await query<EstabelecimentoPorTipoRow>(
    `select
       coalesce(descricao_natureza_juridica, 'Código ' || codigo_natureza_juridica) as tipo,
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

export function mapRowToEstabelecimentoDetalhe(
  row: EstabelecimentoDetalheRow,
): EstabelecimentoDetalhe {
  return {
    codigoCnes: row.codigo_cnes,
    tipoUnidade: row.tipo_unidade,
    naturezaJuridica: row.natureza_juridica,
    tipoGestao: row.tipo_gestao,
    temVinculoSus: row.tem_vinculo_sus,
  };
}

/**
 * `limite` evita mandar os ~17 mil estabelecimentos do Rio de Janeiro
 * inteiro para o client — usar getTotalEstabelecimentosCnes para mostrar
 * "exibindo N de M" ao lado desta lista.
 */
export async function getListaEstabelecimentos(
  municipioId: number,
  limite = 100,
): Promise<EstabelecimentoDetalhe[]> {
  const rows = await query<EstabelecimentoDetalheRow>(
    `select
       codigo_cnes,
       coalesce(descricao_tipo_unidade, 'Código ' || codigo_tipo_unidade) as tipo_unidade,
       coalesce(descricao_natureza_juridica, 'Código ' || codigo_natureza_juridica) as natureza_juridica,
       tipo_gestao,
       tem_vinculo_sus
     from marts.dim_estabelecimento
     where id_municipio = $1
     order by tipo_unidade, codigo_cnes
     limit $2`,
    [municipioId, limite],
  );
  return rows.map(mapRowToEstabelecimentoDetalhe);
}
