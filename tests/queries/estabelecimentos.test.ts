import { describe, expect, it } from "vitest";
import {
  mapRowToEstabelecimentoDetalhe,
  mapRowToEstabelecimentoPorTipo,
  mapRowToUnidadePossivelmenteEncerrada,
} from "../../lib/queries/estabelecimentos";

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

describe("mapRowToEstabelecimentoDetalhe", () => {
  it("mantém os campos de identificação vindos do cadastro DEMAS", () => {
    const item = mapRowToEstabelecimentoDetalhe({
      codigo_cnes: "1234567",
      nome_fantasia: "UBS Central",
      endereco: "Rua Principal, 100",
      bairro: "Centro",
      tipo_unidade: "Centro de Saúde/Unidade Básica de Saúde",
      natureza_juridica: "Administração Pública Municipal",
      tipo_gestao: "Municipal",
      tem_vinculo_sus: true,
    });

    expect(item.nomeFantasia).toBe("UBS Central");
    expect(item.endereco).toBe("Rua Principal, 100");
    expect(item.bairro).toBe("Centro");
  });
});

describe("mapRowToUnidadePossivelmenteEncerrada", () => {
  it("mapeia a última competência observada para auditoria", () => {
    const unidade = mapRowToUnidadePossivelmenteEncerrada({
      codigo_cnes: "1234567",
      nome_fantasia: "UBS Central",
      tipo_unidade: "Unidade Básica de Saúde",
      ultima_competencia_observada: "10/2025",
    });

    expect(unidade).toEqual({
      codigoCnes: "1234567",
      nomeFantasia: "UBS Central",
      tipoUnidade: "Unidade Básica de Saúde",
      ultimaCompetenciaObservada: "10/2025",
    });
  });
});
