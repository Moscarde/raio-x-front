export type MunicipioComparacaoRj = {
  municipioId: number;
  nomeMunicipio: string;
  nomeMicrorregiao: string;
  populacaoEstimada: number;
  estabelecimentosPor10kHabitantes: number;
  producaoPorMilHabitantes: number;
  municipioReferencia: boolean;
};

export type CriterioPareamento = "populacao" | "porte_rede" | "regiao";

export type PosicaoRanking = {
  posicao: number;
  total: number;
};

export type ValorIndicadorComparativo = {
  municipioId: number;
  valor: number | null;
  valorFormatado: string;
};

export type ChaveIndicadorComparativo =
  | "populacao"
  | "porte_rede"
  | "producao_per_capita"
  | "cobertura_esf"
  | "icsap";

export type LinhaComparativa = {
  chave: ChaveIndicadorComparativo;
  rotulo: string;
  maiorMelhor: boolean;
  valores: ValorIndicadorComparativo[];
};

export type DestaqueComparativo = {
  rotulo: string;
  percentualVsPares: number;
};
