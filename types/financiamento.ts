export type StatusAplicacaoSaude = "ok" | "critico";

export type AplicacaoSaudeMunicipio = {
  anoExercicio: number;
  periodoBimestre: number;
  percentualMinimoExigido: number;
  percentualAplicado: number;
  valorApuradoSaude: number;
  receitaRealizada: number;
  status: StatusAplicacaoSaude;
};

export type FonteRepasse = "fns_fundo_a_fundo" | "portal_transparencia";

export type ResumoRepassesMunicipio = {
  saldoLiquido: number;
  totalLancamentos: number;
};

export type RepassePorFonte = {
  fonte: FonteRepasse;
  saldoLiquido: number;
};

export type LancamentoRepasse = {
  fonte: FonteRepasse;
  dataFormatada: string;
  tipoLancamento: "credito" | "debito";
  descricaoOrigem: string;
  valor: number;
};
