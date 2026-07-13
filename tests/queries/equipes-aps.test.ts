import { describe, expect, it } from "vitest";
import { mapRowToEquipeApsDetalhada } from "../../lib/queries/equipes-aps";

describe("mapRowToEquipeApsDetalhada", () => {
  it("mapeia os atributos estruturais sem inferir desempenho", () => {
    const equipe = mapRowToEquipeApsDetalhada({
      id_equipe: "123",
      sigla_equipe: "ESF 01",
      nome_equipe: "Equipe Saúde da Família 01",
      situacao_equipe: "ATIVA",
      codigo_cnes: "1234567",
      nome_unidade: "UBS Central",
      descricao_tipo_unidade: "Unidade Básica de Saúde",
      endereco: "Rua Principal, 100",
      bairro: "Centro",
      nome_area: "Área 01",
      descricao_segmento: "Famílias adscritas",
    });

    expect(equipe).toEqual({
      equipeId: "123",
      sigla: "ESF 01",
      nome: "Equipe Saúde da Família 01",
      situacao: "ATIVA",
      codigoCnes: "1234567",
      nomeUnidade: "UBS Central",
      tipoUnidade: "Unidade Básica de Saúde",
      endereco: "Rua Principal, 100",
      bairro: "Centro",
      nomeArea: "Área 01",
      descricaoSegmento: "Famílias adscritas",
    });
  });
});
