export type EnvioStatus = 'enviado' | 'pendente' | 'atrasado';

export interface Equipe {
  ine: string;
  nome: string;
  tipo: string;
  municipio: string;
  uf: string;
  status: EnvioStatus;
  ultimoEnvio: string | null;
  fichas: number;
}

export interface Competencia {
  id: string;
  label: string;
  prazo: string;
}
