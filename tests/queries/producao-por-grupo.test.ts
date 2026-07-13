import { describe, expect, it } from "vitest";
import { mapRowToProducaoPorGrupo } from "../../lib/queries/producao-ambulatorial";

describe("mapRowToProducaoPorGrupo", () => {
  it("converte quantidade e valor (numeric como string) para número", () => {
    const item = mapRowToProducaoPorGrupo({
      codigo_grupo: "02",
      descricao_grupo: "Procedimentos com finalidade diagnóstica",
      quantidade_aprovada: "474670",
      valor_aprovado: "3143570.61",
    });

    expect(item).toEqual({
      grupoProcedimento: "02",
      descricaoGrupo: "Procedimentos com finalidade diagnóstica",
      quantidadeAprovada: 474670,
      valorAprovado: 3143570.61,
    });
  });
});
