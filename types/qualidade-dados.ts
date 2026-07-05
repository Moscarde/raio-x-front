export type QualidadeFonte = {
  fonte: string;
  totalRegistros: number;
  totalRegistrosAproximado: boolean;
  municipiosCobertos: number;
  periodoReferencia: string;
  camposCriticosNulos?: {
    campo: string;
    total: number;
  }[];
};
