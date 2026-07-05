export type IndicadorAps = {
  numeroIndicador: number;
  descricaoIndicador: string;
  percentual: number;
  percentualQuadrimestre: number;
  populacaoCoberta: number;
  quadrimestre: string;
};

export type VisaoEquipe = "geral" | "homologadas" | "validas";

export type IndicadorApsPorVisao = {
  numeroIndicador: number;
  descricaoIndicador: string;
  visaoEquipe: VisaoEquipe;
  percentual: number;
  numerador: number;
  denominadorUtilizador: number;
};
