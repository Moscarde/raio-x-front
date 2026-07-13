export type StatusMetaAps = "ok" | "atencao" | "critico";

export type IndicadorAps = {
  numeroIndicador: number;
  descricaoIndicador: string;
  percentual: number;
  percentualQuadrimestre: number;
  populacaoCoberta: number;
  quadrimestre: string;
  parametroPercentual: number | null;
  metaPercentual: number | null;
  statusMeta: StatusMetaAps | null;
};

export type VisaoEquipe = "geral" | "homologadas" | "validas";

export type IndicadorApsPorVisao = {
  numeroIndicador: number;
  descricaoIndicador: string;
  visaoEquipe: VisaoEquipe;
  percentual: number;
  numerador: number;
  denominadorUtilizador: number;
  parametroPercentual: number | null;
  metaPercentual: number | null;
  statusMeta: StatusMetaAps | null;
};
