import { query } from "@/lib/db/postgres";
import type { EquipeApsDetalhada } from "@/types/equipe-aps";

type EquipeApsDetalhadaRow = {
  id_equipe: string;
  sigla_equipe: string | null;
  nome_equipe: string | null;
  situacao_equipe: string | null;
  codigo_cnes: string;
  nome_unidade: string | null;
  descricao_tipo_unidade: string | null;
  endereco: string | null;
  bairro: string | null;
  nome_area: string | null;
  descricao_segmento: string | null;
};

export function mapRowToEquipeApsDetalhada(
  row: EquipeApsDetalhadaRow,
): EquipeApsDetalhada {
  return {
    equipeId: row.id_equipe,
    sigla: row.sigla_equipe,
    nome: row.nome_equipe,
    situacao: row.situacao_equipe,
    codigoCnes: row.codigo_cnes,
    nomeUnidade: row.nome_unidade,
    tipoUnidade: row.descricao_tipo_unidade,
    endereco: row.endereco,
    bairro: row.bairro,
    nomeArea: row.nome_area,
    descricaoSegmento: row.descricao_segmento,
  };
}

/** Lista equipes APS por município sem inferir desempenho individual. */
export async function getEquipesApsDetalhadas(
  municipioId: number,
  limite = 100,
): Promise<EquipeApsDetalhada[]> {
  const rows = await query<EquipeApsDetalhadaRow>(
    `select id_equipe, sigla_equipe, nome_equipe, situacao_equipe, codigo_cnes,
            nome_unidade, descricao_tipo_unidade, endereco, bairro,
            nome_area, descricao_segmento
     from marts.mart_equipe_aps_detalhada
     where id_municipio = $1
     order by nome_equipe nulls last, id_equipe
     limit $2`,
    [municipioId, limite],
  );
  return rows.map(mapRowToEquipeApsDetalhada);
}

/** Conta equipes para informar o recorte aplicado à listagem. */
export async function getTotalEquipesAps(municipioId: number): Promise<number> {
  const rows = await query<{ total: string }>(
    `select count(*)::text as total
     from marts.mart_equipe_aps_detalhada
     where id_municipio = $1`,
    [municipioId],
  );
  return Number(rows[0]?.total ?? "0");
}
