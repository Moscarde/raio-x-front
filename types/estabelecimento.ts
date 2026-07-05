export type EstabelecimentoPorTipo = {
  tipoUnidade: string;
  total: number;
};

export type EstabelecimentoDetalhe = {
  codigoCnes: string;
  tipoUnidade: string;
  naturezaJuridica: string;
  tipoGestao: string | null;
  temVinculoSus: boolean;
};

export type ResumoRede = {
  totalEstabelecimentos: number;
  comVinculoSus: number;
  tiposDistintos: number;
};
