import { describe, expect, it } from "vitest";
import { mapRowToAlertaPrioritario } from "../../lib/queries/alertas";

describe("mapRowToAlertaPrioritario", () => {
  it("converte a severidade da mart para o contrato visual", () => {
    const alerta = mapRowToAlertaPrioritario({
      id_alerta: "abc123",
      descricao_regra: "Aplicação em saúde abaixo do mínimo constitucional",
      severidade: "alta",
      periodo_referencia: "2025-B4",
      evidencia: "Aplicado 10% no exercício, abaixo do mínimo de 15%",
    });

    expect(alerta).toEqual({
      id: "abc123",
      titulo: "Aplicação em saúde abaixo do mínimo constitucional",
      descricao: "Aplicado 10% no exercício, abaixo do mínimo de 15%. Período: 2025-B4.",
      severidade: "critico",
    });
  });
});
