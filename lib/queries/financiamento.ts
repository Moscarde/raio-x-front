import { query } from "@/lib/db/postgres";
import { parseNumericColumn } from "@/lib/db/numeric";
import type {
  AplicacaoSaudeMunicipio,
  FonteRepasse,
  LancamentoRepasse,
  RepassePorFonte,
  ResumoRepassesMunicipio,
  StatusAplicacaoSaude,
} from "@/types/financiamento";

const LIMITE_LANCAMENTOS_PADRAO = 20;

type AplicacaoSaudeRow = {
  ano_exercicio: number;
  periodo_bimestre: number;
  percentual_minimo: string | null;
  percentual_aplicado: string | null;
  valor_apurado_saude: string | null;
  receita_realizada: string | null;
};

function calcularStatusAplicacao(
  percentualAplicado: number,
  percentualMinimo: number,
): StatusAplicacaoSaude {
  return percentualAplicado >= percentualMinimo ? "ok" : "critico";
}

export function mapRowToAplicacaoSaude(
  row: AplicacaoSaudeRow,
): AplicacaoSaudeMunicipio {
  const percentualMinimoExigido = parseNumericColumn(row.percentual_minimo ?? "0");
  const percentualAplicado = parseNumericColumn(row.percentual_aplicado ?? "0");

  return {
    anoExercicio: row.ano_exercicio,
    periodoBimestre: row.periodo_bimestre,
    percentualMinimoExigido,
    percentualAplicado,
    valorApuradoSaude: parseNumericColumn(row.valor_apurado_saude ?? "0"),
    receitaRealizada: parseNumericColumn(row.receita_realizada ?? "0"),
    status: calcularStatusAplicacao(percentualAplicado, percentualMinimoExigido),
  };
}

/**
 * mart_financiamento_saude_siops é EAV (codigo_conta × coluna → valor, um
 * demonstrativo RREO Anexo 14 inteiro por linha) — pivota só as contas que a
 * página usa. "% Aplicado Até o Bimestre" é o indicador oficial da LC
 * 141/2012, mesma conta que a regra de alerta `siops_abaixo_minimo` usa
 * (ver mart_alertas_saude no raio-x-engenharia).
 */
export async function getAplicacaoSaude(
  municipioId: number,
): Promise<AplicacaoSaudeMunicipio | null> {
  const rows = await query<AplicacaoSaudeRow>(
    `select ano_exercicio, periodo_bimestre,
            max(valor) filter (
              where codigo_conta = 'AplicacaoTotalDasDespesasComAcoesEServicosPublicosDeSaude'
                and coluna = '% Mínimo a Aplicar no Exercício'
            ) as percentual_minimo,
            max(valor) filter (
              where codigo_conta = 'AplicacaoTotalDasDespesasComAcoesEServicosPublicosDeSaude'
                and coluna = '% Aplicado Até o Bimestre'
            ) as percentual_aplicado,
            max(valor) filter (
              where codigo_conta = 'AplicacaoTotalDasDespesasComAcoesEServicosPublicosDeSaude'
                and coluna = 'Valor Apurado Até o Bimestre'
            ) as valor_apurado_saude,
            max(valor) filter (
              where codigo_conta = 'ReceitasRealizadasDemonstrativoSimplificadoBalancoOrcamentario'
                and coluna = 'Até o Bimestre'
            ) as receita_realizada
     from marts.mart_financiamento_saude_siops
     where id_municipio = $1
     group by ano_exercicio, periodo_bimestre
     order by ano_exercicio desc, periodo_bimestre desc
     limit 1`,
    [municipioId],
  );
  return rows[0] ? mapRowToAplicacaoSaude(rows[0]) : null;
}

type ResumoRepassesRow = {
  saldo_liquido: string;
  total_lancamentos: string;
};

export function mapRowToResumoRepasses(
  row: ResumoRepassesRow,
): ResumoRepassesMunicipio {
  return {
    saldoLiquido: parseNumericColumn(row.saldo_liquido),
    totalLancamentos: parseNumericColumn(row.total_lancamentos),
  };
}

/**
 * "Saldo líquido" soma crédito e débito já normalizados pela mart (FNS
 * reporta débito com valor sempre positivo + flag separada; Portal da
 * Transparência já usa sinal negativo — a mart resolve os dois pro mesmo
 * sinal, não resomar as fontes por conta própria). É a mesma métrica usada
 * pela regra de alerta `financiamento_liquido_negativo`.
 */
export async function getResumoRepasses(
  municipioId: number,
): Promise<ResumoRepassesMunicipio> {
  const rows = await query<ResumoRepassesRow>(
    `select coalesce(sum(valor), 0) as saldo_liquido, count(*) as total_lancamentos
     from marts.mart_financiamento_saude_uniao
     where id_municipio = $1`,
    [municipioId],
  );
  return mapRowToResumoRepasses(
    rows[0] ?? { saldo_liquido: "0", total_lancamentos: "0" },
  );
}

type RepassePorFonteRow = {
  fonte: FonteRepasse;
  saldo_liquido: string;
};

export function mapRowToRepassePorFonte(row: RepassePorFonteRow): RepassePorFonte {
  return {
    fonte: row.fonte,
    saldoLiquido: parseNumericColumn(row.saldo_liquido),
  };
}

export async function getRepassesPorFonte(
  municipioId: number,
): Promise<RepassePorFonte[]> {
  const rows = await query<RepassePorFonteRow>(
    `select fonte, sum(valor) as saldo_liquido
     from marts.mart_financiamento_saude_uniao
     where id_municipio = $1
     group by fonte
     order by fonte`,
    [municipioId],
  );
  return rows.map(mapRowToRepassePorFonte);
}

type LancamentoRepasseRow = {
  fonte: FonteRepasse;
  data_formatada: string;
  tipo_lancamento: "credito" | "debito";
  descricao_origem: string;
  valor: string;
};

export function mapRowToLancamentoRepasse(
  row: LancamentoRepasseRow,
): LancamentoRepasse {
  return {
    fonte: row.fonte,
    dataFormatada: row.data_formatada,
    tipoLancamento: row.tipo_lancamento,
    descricaoOrigem: row.descricao_origem,
    valor: parseNumericColumn(row.valor),
  };
}

export async function getLancamentosRepasses(
  municipioId: number,
  limite: number = LIMITE_LANCAMENTOS_PADRAO,
): Promise<LancamentoRepasse[]> {
  const rows = await query<LancamentoRepasseRow>(
    `select fonte, to_char(data_referencia, 'DD/MM/YYYY') as data_formatada,
            tipo_lancamento, descricao_origem, valor
     from marts.mart_financiamento_saude_uniao
     where id_municipio = $1
     order by data_referencia desc
     limit $2`,
    [municipioId, limite],
  );
  return rows.map(mapRowToLancamentoRepasse);
}
