import { unstable_cache } from "next/cache";
import { query } from "@/lib/db/postgres";
import type { MunicipioResumo } from "@/types/municipio";

type MunicipioRow = {
  id_municipio: number;
  nome_municipio: string;
  sigla_uf: string;
  nome_microrregiao: string;
  nome_mesorregiao: string;
  nome_regiao: string;
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

/**
 * dim_municipio cobre os 5.571 municípios do Brasil (dimensão IBGE
 * completa), mas só os municípios com pelo menos uma fonte carregada (SIH,
 * SIM ou SINASC) têm dado real hoje — ver ROADMAP.md do raio-x-engenharia.
 */
async function buscarMunicipiosDisponiveis(): Promise<MunicipioResumo[]> {
  const rows = await query<MunicipioRow>(`
    with municipios_com_dado as (
      select distinct id_municipio_estabelecimento as id_municipio from marts.fct_internacoes
      union
      select distinct id_municipio_ocorrencia from marts.fct_obitos
      union
      select distinct id_municipio_nascimento from marts.fct_nascidos_vivos
    )
    select m.id_municipio, m.nome_municipio, m.sigla_uf, m.nome_microrregiao, m.nome_mesorregiao, m.nome_regiao
    from marts.dim_municipio m
    join municipios_com_dado d on d.id_municipio = m.id_municipio
    order by m.nome_municipio
  `);
  return rows.map(mapRowToMunicipioResumo);
}

export const getMunicipiosDisponiveis = unstable_cache(
  buscarMunicipiosDisponiveis,
  ["municipios-disponiveis"],
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
