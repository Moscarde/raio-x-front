import { unstable_cache } from "next/cache";
import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type { MunicipioResumo, MunicipioRjResumo } from "@/types/municipio";

type MunicipioRow = {
  id_municipio: number;
  nome_municipio: string;
  sigla_uf: string;
  nome_microrregiao: string;
  nome_mesorregiao: string;
  nome_regiao: string;
};

type MunicipioRjRow = MunicipioRow & {
  populacao_estimada: string;
};

export function mapRowToMunicipioResumo(row: MunicipioRow): MunicipioResumo {
  return {
    municipioId: row.id_municipio,
    nomeMunicipio: row.nome_municipio,
    siglaUf: row.sigla_uf,
    nomeMicrorregiao: row.nome_microrregiao,
    nomeMesorregiao: row.nome_mesorregiao,
    nomeRegiao: row.nome_regiao,
  };
}

export function mapRowToMunicipioRjResumo(row: MunicipioRjRow): MunicipioRjResumo {
  return {
    ...mapRowToMunicipioResumo(row),
    populacaoEstimada: parseNumericColumn(row.populacao_estimada),
  };
}

/** Lista os municípios do RJ com cobertura nas marts municipais do dashboard. */
async function buscarMunicipiosDisponiveis(): Promise<MunicipioResumo[]> {
  const rows = await query<MunicipioRow>(`
    select
      m.id_municipio,
      m.nome_municipio,
      m.sigla_uf,
      m.nome_microrregiao,
      m.nome_mesorregiao,
      m.nome_regiao
    from marts.dim_municipio m
    join marts.mart_comparacao_municipios_rj c on c.id_municipio = m.id_municipio
    order by m.nome_municipio
  `);
  return rows.map(mapRowToMunicipioResumo);
}

export const getMunicipiosDisponiveis = unstable_cache(
  buscarMunicipiosDisponiveis,
  ["municipios-disponiveis"],
  { revalidate: 3600 },
);

async function buscarMunicipiosRjPorPopulacao(): Promise<MunicipioRjResumo[]> {
  const rows = await query<MunicipioRjRow>(`
    select
      m.id_municipio,
      m.nome_municipio,
      m.sigla_uf,
      m.nome_microrregiao,
      m.nome_mesorregiao,
      m.nome_regiao,
      c.populacao_estimada
    from marts.mart_comparacao_municipios_rj c
    join marts.dim_municipio m on m.id_municipio = c.id_municipio
    order by c.populacao_estimada desc, m.nome_municipio
  `);
  return rows.map(mapRowToMunicipioRjResumo);
}

export const getMunicipiosRjPorPopulacao = unstable_cache(
  buscarMunicipiosRjPorPopulacao,
  ["municipios-rj-por-populacao"],
  { revalidate: 3600 },
);

export async function getMunicipioResumo(
  municipioId: number,
): Promise<MunicipioResumo | null> {
  const rows = await query<MunicipioRow>(
    `select id_municipio, nome_municipio, sigla_uf, nome_microrregiao, nome_mesorregiao, nome_regiao
     from marts.dim_municipio
     where id_municipio = $1`,
    [municipioId],
  );
  return rows[0] ? mapRowToMunicipioResumo(rows[0]) : null;
}
