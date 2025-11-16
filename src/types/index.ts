/**
 * Tipos principais da aplicação
 */

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface Atividade {
  id: string;
  userId: string;
  titulo: string;
  descricao: string;
  data: Date;
  concluida: boolean;
  categoria: CategoriaAtividade;
  prioridade: PrioridadeAtividade;
  createdAt: Date;
  updatedAt: Date;
}

export enum CategoriaAtividade {
  TRABALHO = 'trabalho',
  PESSOAL = 'pessoal',
  EXERCICIO = 'exercicio',
  ESTUDO = 'estudo',
  LAZER = 'lazer',
}

export enum PrioridadeAtividade {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
}

export interface ProgressoDiario {
  data: string; // formato YYYY-MM-DD
  totalAtividades: number;
  atividadesConcluidas: number;
  percentualConclusao: number;
}

export interface RootStackParamList {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  ActivityForm: { activityId?: string };
  ActivityDetails: { activityId: string };
}

export interface MainTabParamList {
  Home: undefined;
  Calendar: undefined;
  Activities: undefined;
  Profile: undefined;
}
