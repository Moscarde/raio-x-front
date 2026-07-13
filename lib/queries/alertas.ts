import { query } from "@/lib/db/postgres";
import type { AlertaPrioritario, AlertaSeveridade } from "@/types/alerta";

type AlertaRow = {
  id_alerta: string;
  descricao_regra: string;
  severidade: "alta" | "media";
  periodo_referencia: string;
  evidencia: string;
};

function mapSeveridadeAlerta(severidade: AlertaRow["severidade"]): AlertaSeveridade {
  return severidade === "alta" ? "critico" : "atencao";
}

export function mapRowToAlertaPrioritario(
  row: AlertaRow,
): AlertaPrioritario {
  const evidencia = row.evidencia.endsWith(".")
    ? row.evidencia
    : `${row.evidencia}.`;

  return {
    id: row.id_alerta,
    titulo: row.descricao_regra,
    descricao: `${evidencia} Período: ${row.periodo_referencia}.`,
    severidade: mapSeveridadeAlerta(row.severidade),
  };
}

/** Busca alertas ativos do município, em ordem de severidade e referência. */
export async function getAlertasPrioritarios(
  municipioId: number,
  limite?: number,
): Promise<AlertaPrioritario[]> {
  const limitClause = limite === undefined ? "" : "limit $2";
  const params = limite === undefined ? [municipioId] : [municipioId, limite];
  const rows = await query<AlertaRow>(
    `select id_alerta, descricao_regra, severidade, periodo_referencia, evidencia
     from marts.mart_alertas_saude
     where id_municipio = $1
       and status = 'ativo'
     order by case severidade when 'alta' then 1 when 'media' then 2 else 3 end,
              periodo_referencia desc
     ${limitClause}`,
    params,
  );
  return rows.map(mapRowToAlertaPrioritario);
}

/** Conta os alertas ativos para exibir o badge da navegação municipal. */
export async function getTotalAlertasAtivos(
  municipioId: number,
): Promise<number> {
  const rows = await query<{ total: string }>(
    `select count(*)::text as total
     from marts.mart_alertas_saude
     where id_municipio = $1
       and status = 'ativo'`,
    [municipioId],
  );
  return Number(rows[0]?.total ?? "0");
}
