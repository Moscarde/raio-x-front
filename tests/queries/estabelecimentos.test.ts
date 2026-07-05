import { describe, expect, it } from "vitest";
import { mapRowToEstabelecimentoPorTipo } from "../../lib/queries/estabelecimentos";

describe("mapRowToEstabelecimentoPorTipo", () => {
  it("converte total (bigint como string) para número", () => {
    const item = mapRowToEstabelecimentoPorTipo({
      tipo: "Centro de Saúde/Unidade Básica de Saúde",
      total: "13",
    });

    expect(item).toEqual({
      tipoUnidade: "Centro de Saúde/Unidade Básica de Saúde",
      total: 13,
    });
  });
});
