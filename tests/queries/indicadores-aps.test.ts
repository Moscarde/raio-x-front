import { describe, expect, it } from "vitest";
import { mapRowToIndicadorAps } from "../../lib/queries/indicadores-aps";

describe("mapRowToIndicadorAps", () => {
  it("mapeia percentuais e população (numeric como string) para número", () => {
    const indicador = mapRowToIndicadorAps({
      numero_indicador: 1,
      descricao_indicador: "Proporção de gestantes com pelo menos 6 consultas pré-natal",
      percentual: "82",
      percentual_quadrimestre: "54",
      populacao: "45243",
      quadrimestre: "2024Q3",
      parametro_percentual: "80",
      meta_percentual: "45",
      status_meta: "atencao",
    });

    expect(indicador).toEqual({
      numeroIndicador: 1,
      descricaoIndicador: "Proporção de gestantes com pelo menos 6 consultas pré-natal",
      percentual: 82,
      percentualQuadrimestre: 54,
      populacaoCoberta: 45243,
      quadrimestre: "2024Q3",
      parametroPercentual: 80,
      metaPercentual: 45,
      statusMeta: "atencao",
    });
  });
});
