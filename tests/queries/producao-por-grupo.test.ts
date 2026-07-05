import { describe, expect, it } from "vitest";
import { mapRowToProducaoPorGrupo } from "../../lib/queries/producao-ambulatorial";

describe("mapRowToProducaoPorGrupo", () => {
  it("converte quantidade e valor (numeric como string) para número", () => {
    const item = mapRowToProducaoPorGrupo({
      grupo: "02",
      quantidade_aprovada: "474670",
      valor_aprovado: "3143570.61",
    });

    expect(item).toEqual({
      grupoProcedimento: "02",
      quantidadeAprovada: 474670,
      valorAprovado: 3143570.61,
    });
  });
});
