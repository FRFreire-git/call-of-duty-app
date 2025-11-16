import { CategoriaAtividade, PrioridadeAtividade } from '../types';

/**
 * Modelo da Atividade
 * Representa uma atividade/tarefa no sistema
 */
export class Atividade {
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

  constructor(data: Partial<Atividade>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.titulo = data.titulo || '';
    this.descricao = data.descricao || '';
    this.data = data.data || new Date();
    this.concluida = data.concluida || false;
    this.categoria = data.categoria || CategoriaAtividade.PESSOAL;
    this.prioridade = data.prioridade || PrioridadeAtividade.MEDIA;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Converte a atividade para objeto Firestore
   */
  toFirestore() {
    return {
      userId: this.userId,
      titulo: this.titulo,
      descricao: this.descricao,
      data: this.data,
      concluida: this.concluida,
      categoria: this.categoria,
      prioridade: this.prioridade,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Cria atividade a partir de dados do Firestore
   */
  static fromFirestore(id: string, data: any): Atividade {
    return new Atividade({
      id,
      userId: data.userId,
      titulo: data.titulo,
      descricao: data.descricao,
      data: data.data?.toDate() || new Date(),
      concluida: data.concluida,
      categoria: data.categoria,
      prioridade: data.prioridade,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }

  /**
   * Marca a atividade como concluída
   */
  marcarComoConcluida(): void {
    this.concluida = true;
    this.updatedAt = new Date();
  }

  /**
   * Marca a atividade como não concluída
   */
  marcarComoNaoConcluida(): void {
    this.concluida = false;
    this.updatedAt = new Date();
  }

  /**
   * Atualiza os dados da atividade
   */
  atualizar(dados: Partial<Atividade>): void {
    Object.assign(this, dados);
    this.updatedAt = new Date();
  }
}
