import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type { CoberturaApsMunicipio } from "@/types/cobertura-aps";

type CoberturaApsMunicipioRow = {
  ano_referencia_populacao: number;
  populacao_estimada: string;
  competencia_equipes_cnes: string;
  quantidade_equipes_esf_ativas: string;
  quantidade_equipes_aps_ativas_total: string;
  percentual_cobertura_esf: string;
};

export function mapRowToCoberturaAps(
  row: CoberturaApsMunicipioRow,
): CoberturaApsMunicipio {
  return {
    anoReferenciaPopulacao: row.ano_referencia_populacao,
    populacaoEstimada: parseNumericColumn(row.populacao_estimada),
    competenciaEquipesCnes: row.competencia_equipes_cnes,
    quantidadeEquipesEsfAtivas: parseNumericColumn(
      row.quantidade_equipes_esf_ativas,
    ),
    quantidadeEquipesApsAtivasTotal: parseNumericColumn(
      row.quantidade_equipes_aps_ativas_total,
    ),
    percentualCoberturaEsf: parseNumericColumn(row.percentual_cobertura_esf),
  };
}

export async function getCoberturaAps(
  municipioId: number,
): Promise<CoberturaApsMunicipio | null> {
  const rows = await query<CoberturaApsMunicipioRow>(
    `select ano_referencia_populacao, populacao_estimada, competencia_equipes_cnes,
            quantidade_equipes_esf_ativas, quantidade_equipes_aps_ativas_total,
            percentual_cobertura_esf
     from marts.mart_cobertura_aps_municipio
     where id_municipio = $1`,
    [municipioId],
  );
  return rows[0] ? mapRowToCoberturaAps(rows[0]) : null;
}
