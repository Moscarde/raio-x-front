import { describe, expect, it } from "vitest";
import {
  mapRowToAplicacaoSaude,
  mapRowToLancamentoRepasse,
  mapRowToRepassePorFonte,
  mapRowToResumoRepasses,
} from "../../lib/queries/financiamento";

describe("mapRowToAplicacaoSaude", () => {
  it("converte percentuais e valores (numeric como string) e calcula status ok quando aplicado >= mínimo", () => {
    const aplicacao = mapRowToAplicacaoSaude({
      ano_exercicio: 2025,
      periodo_bimestre: 6,
      percentual_minimo: "15",
      percentual_aplicado: "16.98",
      valor_apurado_saude: "3927364651.06",
      receita_realizada: "46534521781.62",
    });

    expect(aplicacao).toEqual({
      anoExercicio: 2025,
      periodoBimestre: 6,
      percentualMinimoExigido: 15,
      percentualAplicado: 16.98,
      valorApuradoSaude: 3_927_364_651.06,
      receitaRealizada: 46_534_521_781.62,
      status: "ok",
    });
  });

  it("marca status crítico quando o percentual aplicado fica abaixo do mínimo", () => {
    const aplicacao = mapRowToAplicacaoSaude({
      ano_exercicio: 2025,
      periodo_bimestre: 6,
      percentual_minimo: "15",
      percentual_aplicado: "12.5",
      valor_apurado_saude: "1000000",
      receita_realizada: "8000000",
    });

    expect(aplicacao.status).toBe("critico");
  });
});

describe("mapRowToResumoRepasses", () => {
  it("converte saldo líquido negativo (débito supera crédito) e total de lançamentos", () => {
    const resumo = mapRowToResumoRepasses({
      saldo_liquido: "-60774.46",
      total_lancamentos: "16",
    });

    expect(resumo).toEqual({ saldoLiquido: -60774.46, totalLancamentos: 16 });
  });
});

describe("mapRowToRepassePorFonte", () => {
  it("converte saldo líquido por fonte", () => {
    const item = mapRowToRepassePorFonte({
      fonte: "fns_fundo_a_fundo",
      saldo_liquido: "29.09",
    });

    expect(item).toEqual({ fonte: "fns_fundo_a_fundo", saldoLiquido: 29.09 });
  });
});

describe("mapRowToLancamentoRepasse", () => {
  it("mantém a data já formatada pelo SQL e converte o valor", () => {
    const lancamento = mapRowToLancamentoRepasse({
      fonte: "fns_fundo_a_fundo",
      data_formatada: "02/01/2025",
      tipo_lancamento: "debito",
      descricao_origem: "TED Transf.Eletr.Disponivel",
      valor: "-69567.81",
    });

    expect(lancamento).toEqual({
      fonte: "fns_fundo_a_fundo",
      dataFormatada: "02/01/2025",
      tipoLancamento: "debito",
      descricaoOrigem: "TED Transf.Eletr.Disponivel",
      valor: -69567.81,
    });
  });
});
