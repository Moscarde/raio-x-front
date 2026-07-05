export type ProducaoMensalPoint = {
  competencia: string;
  competenciaLabel: string;
  quantidadeAprovada: number;
  media12m: number;
};

export type ProducaoPorGrupo = {
  grupoProcedimento: string;
  quantidadeAprovada: number;
  valorAprovado: number;
};
