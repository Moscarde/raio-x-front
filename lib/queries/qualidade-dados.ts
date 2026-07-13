import { unstable_cache } from "next/cache";
import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type { QualidadeFonte } from "@/types/qualidade-dados";

type QualidadeCnesRow = {
  total: string;
  municipios: string;
  sem_tipo: string;
  sem_natureza: string;
};

export function mapRowToQualidadeCnes(row: QualidadeCnesRow): QualidadeFonte {
  return {
    fonte: "CNES",
    totalRegistros: parseNumericColumn(row.total),
    totalRegistrosAproximado: false,
    municipiosCobertos: parseNumericColumn(row.municipios),
    periodoReferencia: "Competência única: dezembro/2025",
    camposCriticosNulos: [
      {
        campo: "descricao_tipo_unidade",
        total: parseNumericColumn(row.sem_tipo),
      },
      {
        campo: "descricao_natureza_juridica",
        total: parseNumericColumn(row.sem_natureza),
      },
    ],
  };
}

async function buscarQualidadeCnes(): Promise<QualidadeFonte> {
  const rows = await query<QualidadeCnesRow>(
    `select
       count(*) as total,
       count(distinct id_municipio) as municipios,
       count(*) filter (where descricao_tipo_unidade is null) as sem_tipo,
       count(*) filter (where descricao_natureza_juridica is null) as sem_natureza
     from marts.dim_estabelecimento`,
  );
  return mapRowToQualidadeCnes(
    rows[0] ?? { total: "0", municipios: "0", sem_tipo: "0", sem_natureza: "0" },
  );
}

type QualidadeContagemRow = {
  total: string;
  municipios: string;
};

export function mapRowToQualidadeSih(row: QualidadeContagemRow): QualidadeFonte {
  return {
    fonte: "SIH",
    totalRegistros: parseNumericColumn(row.total),
    totalRegistrosAproximado: false,
    municipiosCobertos: parseNumericColumn(row.municipios),
    periodoReferencia: "2025 completo (12 competências)",
  };
}

async function buscarQualidadeSih(): Promise<QualidadeFonte> {
  const rows = await query<QualidadeContagemRow>(
    `select count(*) as total, count(distinct id_municipio_estabelecimento) as municipios
     from marts.fct_internacoes`,
  );
  return mapRowToQualidadeSih(rows[0] ?? { total: "0", municipios: "0" });
}

export function mapRowToQualidadeSisab(
  row: QualidadeContagemRow,
): QualidadeFonte {
  return {
    fonte: "SISAB",
    totalRegistros: parseNumericColumn(row.total),
    totalRegistrosAproximado: false,
    municipiosCobertos: parseNumericColumn(row.municipios),
    periodoReferencia:
      "2024Q3 — Previne Brasil extinto em 2024, sem quadrimestre mais recente",
  };
}

async function buscarQualidadeSisab(): Promise<QualidadeFonte> {
  const rows = await query<QualidadeContagemRow>(
    `select count(*) as total, count(distinct id_municipio) as municipios
     from marts.mart_indicadores_aps`,
  );
  return mapRowToQualidadeSisab(rows[0] ?? { total: "0", municipios: "0" });
}

export function mapRowToQualidadeSia(row: { total: string }): QualidadeFonte {
  return {
    fonte: "SIA",
    totalRegistros: parseNumericColumn(row.total),
    totalRegistrosAproximado: false,
    municipiosCobertos: 3,
    periodoReferencia: "jan/2025 a dez/2025 (12 competências, RJ inteiro)",
  };
}

async function buscarQualidadeSia(): Promise<QualidadeFonte> {
  const rows = await query<{ total: string }>(
    `select coalesce(sum(quantidade_registros), 0)::text as total
     from marts.mart_producao_grupo_municipio`,
  );
  return mapRowToQualidadeSia(rows[0] ?? { total: "0" });
}

async function buscarQualidadeDados(): Promise<QualidadeFonte[]> {
  return Promise.all([
    buscarQualidadeCnes(),
    buscarQualidadeSia(),
    buscarQualidadeSih(),
    buscarQualidadeSisab(),
  ]);
}

export const getQualidadeDados = unstable_cache(
  buscarQualidadeDados,
  ["qualidade-dados"],
  { revalidate: 60 * 60 * 24 },
);
