export type AlertaSeveridade = "critico" | "atencao";

export type AlertaPrioritario = {
  id: string;
  titulo: string;
  descricao: string;
  severidade: AlertaSeveridade;
};
