import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Atividade } from '../models/Atividade';
import { Atividade as AtividadeType, ProgressoDiario } from '../types';

/**
 * Serviço de Atividades
 * Gerencia todas as operações CRUD de atividades no Firestore
 */
class AtividadeService {
  private collectionName = 'atividades';

  /**
   * Cria uma nova atividade
   */
  async criarAtividade(atividade: Omit<AtividadeType, 'id'>): Promise<string> {
    try {
      const atividadeObj = new Atividade(atividade);
      const docRef = await addDoc(
        collection(firestore, this.collectionName),
        atividadeObj.toFirestore()
      );
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      throw error;
    }
  }

  /**
   * Busca atividade por ID
   */
  async buscarAtividadePorId(id: string): Promise<Atividade | null> {
    try {
      const docSnap = await getDoc(doc(firestore, this.collectionName, id));
      
      if (docSnap.exists()) {
        return Atividade.fromFirestore(docSnap.id, docSnap.data());
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      throw error;
    }
  }

  /**
   * Busca todas as atividades do usuário
   */
  async buscarAtividadesDoUsuario(userId: string): Promise<Atividade[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId),
        orderBy('data', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const atividades: Atividade[] = [];
      
      querySnapshot.forEach((doc) => {
        atividades.push(Atividade.fromFirestore(doc.id, doc.data()));
      });
      
      return atividades;
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca atividades do usuário por data
   */
  async buscarAtividadesPorData(userId: string, data: Date): Promise<Atividade[]> {
    try {
      const inicioDia = new Date(data);
      inicioDia.setHours(0, 0, 0, 0);
      
      const fimDia = new Date(data);
      fimDia.setHours(23, 59, 59, 999);

      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId),
        where('data', '>=', Timestamp.fromDate(inicioDia)),
        where('data', '<=', Timestamp.fromDate(fimDia)),
        orderBy('data', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const atividades: Atividade[] = [];
      
      querySnapshot.forEach((doc) => {
        atividades.push(Atividade.fromFirestore(doc.id, doc.data()));
      });
      
      return atividades;
    } catch (error) {
      console.error('Erro ao buscar atividades por data:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma atividade
   */
  async atualizarAtividade(id: string, dados: Partial<AtividadeType>): Promise<void> {
    try {
      const atividade = new Atividade(dados);
      await updateDoc(doc(firestore, this.collectionName, id), {
        ...atividade.toFirestore(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw error;
    }
  }

  /**
   * Marca atividade como concluída/não concluída
   */
  async toggleConclusaoAtividade(id: string, concluida: boolean): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.collectionName, id), {
        concluida,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao alterar status da atividade:', error);
      throw error;
    }
  }

  /**
   * Deleta uma atividade
   */
  async deletarAtividade(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.collectionName, id));
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      throw error;
    }
  }

  /**
   * Escuta mudanças em tempo real das atividades do usuário
   */
  escutarAtividadesDoUsuario(
    userId: string,
    callback: (atividades: Atividade[]) => void
  ) {
    const q = query(
      collection(firestore, this.collectionName),
      where('userId', '==', userId),
      orderBy('data', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const atividades: Atividade[] = [];
      querySnapshot.forEach((doc) => {
        atividades.push(Atividade.fromFirestore(doc.id, doc.data()));
      });
      callback(atividades);
    });
  }

  /**
   * Calcula o progresso diário de atividades
   */
  async calcularProgressoDiario(userId: string, data: Date): Promise<ProgressoDiario> {
    try {
      const atividades = await this.buscarAtividadesPorData(userId, data);
      const totalAtividades = atividades.length;
      const atividadesConcluidas = atividades.filter(a => a.concluida).length;
      
      const percentualConclusao = totalAtividades > 0 
        ? Math.round((atividadesConcluidas / totalAtividades) * 100)
        : 0;

      const dataStr = data.toISOString().split('T')[0];

      return {
        data: dataStr,
        totalAtividades,
        atividadesConcluidas,
        percentualConclusao,
      };
    } catch (error) {
      console.error('Erro ao calcular progresso diário:', error);
      throw error;
    }
  }

  /**
   * Busca progresso de múltiplos dias
   */
  async buscarProgressoPeríodo(
    userId: string,
    dataInicio: Date,
    dataFim: Date
  ): Promise<ProgressoDiario[]> {
    try {
      const progressos: ProgressoDiario[] = [];
      const dataAtual = new Date(dataInicio);

      while (dataAtual <= dataFim) {
        const progresso = await this.calcularProgressoDiario(userId, new Date(dataAtual));
        progressos.push(progresso);
        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      return progressos;
    } catch (error) {
      console.error('Erro ao buscar progresso do período:', error);
      throw error;
    }
  }
}

export default new AtividadeService();
