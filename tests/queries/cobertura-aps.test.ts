import { describe, expect, it } from "vitest";
import { mapRowToCoberturaAps } from "../../lib/queries/cobertura-aps";

describe("mapRowToCoberturaAps", () => {
  it("converte população e percentual (numeric/bigint como string) para número", () => {
    const cobertura = mapRowToCoberturaAps({
      ano_referencia_populacao: 2025,
      populacao_estimada: "6730729",
      competencia_equipes_cnes: "202512",
      quantidade_equipes_esf_ativas: "1376",
      quantidade_equipes_aps_ativas_total: "1489",
      percentual_cobertura_esf: "82.7",
    });

    expect(cobertura).toEqual({
      anoReferenciaPopulacao: 2025,
      populacaoEstimada: 6730729,
      competenciaEquipesCnes: "202512",
      quantidadeEquipesEsfAtivas: 1376,
      quantidadeEquipesApsAtivasTotal: 1489,
      percentualCoberturaEsf: 82.7,
    });
  });
});
