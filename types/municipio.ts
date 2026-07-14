export type MunicipioResumo = {
  municipioId: number;
  nomeMunicipio: string;
  siglaUf: string;
  nomeMicrorregiao: string;
  nomeMesorregiao: string;
  nomeRegiao: string;
};

export type MunicipioRjResumo = MunicipioResumo & {
  populacaoEstimada: number;
};
