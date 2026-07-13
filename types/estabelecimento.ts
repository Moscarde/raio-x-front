export type EstabelecimentoPorTipo = {
  tipoUnidade: string;
  total: number;
};

export type EstabelecimentoDetalhe = {
  codigoCnes: string;
  nomeFantasia: string | null;
  endereco: string | null;
  bairro: string | null;
  tipoUnidade: string;
  naturezaJuridica: string;
  tipoGestao: string | null;
  temVinculoSus: boolean;
};

export type UnidadePossivelmenteEncerrada = {
  codigoCnes: string;
  nomeFantasia: string | null;
  tipoUnidade: string | null;
  ultimaCompetenciaObservada: string;
};

export type ResumoRede = {
  totalEstabelecimentos: number;
  comVinculoSus: number;
  tiposDistintos: number;
};
