import { describe, expect, it } from "vitest";
import {
  calcularDestaques,
  calcularPosicao,
  mapRowToMunicipioComparacaoRj,
  selecionarPares,
} from "../../lib/queries/comparacao-municipios";
import type {
  LinhaComparativa,
  MunicipioComparacaoRj,
} from "../../types/comparacao-municipio";

function municipio(
  overrides: Partial<MunicipioComparacaoRj>,
): MunicipioComparacaoRj {
  return {
    municipioId: 1,
    nomeMunicipio: "Município Teste",
    nomeMicrorregiao: "Região Teste",
    populacaoEstimada: 100_000,
    estabelecimentosPor10kHabitantes: 10,
    producaoPorMilHabitantes: 500,
    municipioReferencia: false,
    ...overrides,
  };
}

describe("mapRowToMunicipioComparacaoRj", () => {
  it("calcula produção per capita a partir de população e produção anual", () => {
    const resultado = mapRowToMunicipioComparacaoRj({
      id_municipio: 3304557,
      nome_municipio: "Rio de Janeiro",
      nome_microrregiao: "Rio de Janeiro",
      populacao_estimada: "1000000",
      estabelecimentos_por_10k_habitantes: "25.82",
      producao_2025: "500000",
      municipio_referencia: true,
    });

    expect(resultado).toEqual({
      municipioId: 3304557,
      nomeMunicipio: "Rio de Janeiro",
      nomeMicrorregiao: "Rio de Janeiro",
      populacaoEstimada: 1_000_000,
      estabelecimentosPor10kHabitantes: 25.82,
      producaoPorMilHabitantes: 500,
      municipioReferencia: true,
    });
  });

  it("não divide por zero quando população estimada é zero", () => {
    const resultado = mapRowToMunicipioComparacaoRj({
      id_municipio: 1,
      nome_municipio: "Sem população",
      nome_microrregiao: "Região X",
      populacao_estimada: "0",
      estabelecimentos_por_10k_habitantes: "0",
      producao_2025: "0",
      municipio_referencia: false,
    });

    expect(resultado.producaoPorMilHabitantes).toBe(0);
  });
});

describe("selecionarPares", () => {
  const alvo = municipio({ municipioId: 1, populacaoEstimada: 100_000, estabelecimentosPor10kHabitantes: 10, nomeMicrorregiao: "A" });
  const todos = [
    alvo,
    municipio({ municipioId: 2, populacaoEstimada: 90_000, estabelecimentosPor10kHabitantes: 20, nomeMicrorregiao: "A" }),
    municipio({ municipioId: 3, populacaoEstimada: 110_000, estabelecimentosPor10kHabitantes: 8, nomeMicrorregiao: "B" }),
    municipio({ municipioId: 4, populacaoEstimada: 500_000, estabelecimentosPor10kHabitantes: 30, nomeMicrorregiao: "B" }),
  ];

  it("por população, ordena pelos mais próximos em módulo, excluindo o alvo", () => {
    const pares = selecionarPares(alvo, todos, "populacao", 2);
    expect(pares.map((m) => m.municipioId)).toEqual([2, 3]);
  });

  it("por porte de rede, ordena pela distância de estabelecimentos/10k hab.", () => {
    const pares = selecionarPares(alvo, todos, "porte_rede", 2);
    expect(pares.map((m) => m.municipioId)).toEqual([3, 2]);
  });

  it("por região, restringe à mesma microrregião do alvo", () => {
    const pares = selecionarPares(alvo, todos, "regiao", 5);
    expect(pares.map((m) => m.municipioId)).toEqual([2]);
  });
});

describe("calcularPosicao", () => {
  it("posiciona o alvo entre os municípios com valor, maior é melhor", () => {
    const posicao = calcularPosicao(
      [
        { municipioId: 1, valor: 10, valorFormatado: "10" },
        { municipioId: 2, valor: 30, valorFormatado: "30" },
        { municipioId: 3, valor: 20, valorFormatado: "20" },
      ],
      true,
      1,
    );
    expect(posicao).toEqual({ posicao: 3, total: 3 });
  });

  it("ignora municípios sem valor no total", () => {
    const posicao = calcularPosicao(
      [
        { municipioId: 1, valor: 10, valorFormatado: "10" },
        { municipioId: 2, valor: null, valorFormatado: "—" },
      ],
      true,
      1,
    );
    expect(posicao).toEqual({ posicao: 1, total: 1 });
  });

  it("retorna null quando ninguém tem valor", () => {
    const posicao = calcularPosicao(
      [{ municipioId: 1, valor: null, valorFormatado: "—" }],
      true,
      1,
    );
    expect(posicao).toBeNull();
  });
});

describe("calcularDestaques", () => {
  const alvoId = 1;

  function linha(
    chave: LinhaComparativa["chave"],
    rotulo: string,
    maiorMelhor: boolean,
    valores: LinhaComparativa["valores"],
  ): LinhaComparativa {
    return { chave, rotulo, maiorMelhor, valores };
  }

  it("ponto forte é o indicador com maior desvio positivo vs. média dos pares", () => {
    const linhas: LinhaComparativa[] = [
      linha("porte_rede", "Porte de rede", true, [
        { municipioId: 1, valor: 20, valorFormatado: "20" },
        { municipioId: 2, valor: 10, valorFormatado: "10" },
      ]),
      linha("icsap", "ICSAP", false, [
        { municipioId: 1, valor: 15, valorFormatado: "15" },
        { municipioId: 2, valor: 10, valorFormatado: "10" },
      ]),
    ];

    const { pontoForte, pontoFraco } = calcularDestaques(linhas, alvoId);

    expect(pontoForte?.rotulo).toBe("Porte de rede");
    expect(pontoForte?.percentualVsPares).toBeCloseTo(100);
    expect(pontoFraco?.rotulo).toBe("ICSAP");
    expect(pontoFraco?.percentualVsPares).toBeCloseTo(-50);
  });

  it("exclui população da análise de força/fraqueza", () => {
    const linhas: LinhaComparativa[] = [
      linha("populacao", "População", true, [
        { municipioId: 1, valor: 1_000_000, valorFormatado: "1.000.000" },
        { municipioId: 2, valor: 10_000, valorFormatado: "10.000" },
      ]),
    ];

    const { pontoForte, pontoFraco } = calcularDestaques(linhas, alvoId);
    expect(pontoForte).toBeNull();
    expect(pontoFraco).toBeNull();
  });

  it("sem pares com valor, retorna força e fraqueza nulas", () => {
    const linhas: LinhaComparativa[] = [
      linha("cobertura_esf", "Cobertura APS", true, [
        { municipioId: 1, valor: 50, valorFormatado: "50%" },
        { municipioId: 2, valor: null, valorFormatado: "—" },
      ]),
    ];

    const { pontoForte, pontoFraco } = calcularDestaques(linhas, alvoId);
    expect(pontoForte).toBeNull();
    expect(pontoFraco).toBeNull();
  });
});
