import { useState, useEffect, useCallback } from 'react';
import AtividadeService from '../services/AtividadeService';
import { Atividade } from '../models/Atividade';
import { ProgressoDiario } from '../types';

/**
 * Hook para gerenciar atividades
 */
export const useAtividades = (userId?: string) => {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega atividades do usuário
  const carregarAtividades = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const atividadesCarregadas = await AtividadeService.buscarAtividadesDoUsuario(userId);
      setAtividades(atividadesCarregadas);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      setError('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Escuta mudanças em tempo real
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = AtividadeService.escutarAtividadesDoUsuario(userId, (novasAtividades) => {
      setAtividades(novasAtividades);
    });

    return unsubscribe;
  }, [userId]);

  // Cria nova atividade
  const criarAtividade = async (dados: Omit<Atividade, 'id'>) => {
    try {
      setError(null);
      const id = await AtividadeService.criarAtividade(dados);
      return id;
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      setError('Erro ao criar atividade');
      throw error;
    }
  };

  // Atualiza atividade
  const atualizarAtividade = async (id: string, dados: Partial<Atividade>) => {
    try {
      setError(null);
      await AtividadeService.atualizarAtividade(id, dados);
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      setError('Erro ao atualizar atividade');
      throw error;
    }
  };

  // Toggle conclusão da atividade
  const toggleConclusao = async (id: string, concluida: boolean) => {
    try {
      setError(null);
      await AtividadeService.toggleConclusaoAtividade(id, concluida);
    } catch (error) {
      console.error('Erro ao alterar status da atividade:', error);
      setError('Erro ao alterar status da atividade');
      throw error;
    }
  };

  // Deleta atividade
  const deletarAtividade = async (id: string) => {
    try {
      setError(null);
      await AtividadeService.deletarAtividade(id);
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      setError('Erro ao deletar atividade');
      throw error;
    }
  };

  return {
    atividades,
    loading,
    error,
    carregarAtividades,
    criarAtividade,
    atualizarAtividade,
    toggleConclusao,
    deletarAtividade,
  };
};

/**
 * Hook para gerenciar progresso diário
 */
export const useProgressoDiario = (userId?: string) => {
  const [progresso, setProgresso] = useState<ProgressoDiario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularProgresso = useCallback(async (data: Date) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const progressoCalculado = await AtividadeService.calcularProgressoDiario(userId, data);
      setProgresso(progressoCalculado);
    } catch (error) {
      console.error('Erro ao calcular progresso:', error);
      setError('Erro ao calcular progresso');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    progresso,
    loading,
    error,
    calcularProgresso,
  };
};
