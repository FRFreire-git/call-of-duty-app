import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useAtividades, useProgressoDiario } from '../hooks/useAtividades';
import { MainTabParamList } from '../types';
import { Atividade } from '../models/Atividade';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

/**
 * Tela Principal (Home)
 * Mostra resumo diário, progresso e gamificação
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { atividades, loading: atividadesLoading, toggleConclusao } = useAtividades(user?.id);
  const { progresso, loading: progressoLoading, calcularProgresso } = useProgressoDiario(user?.id);
  
  const [refreshing, setRefreshing] = useState(false);

  const hoje = new Date();
  const atividadesHoje = atividades.filter(atividade => {
    const dataAtividade = new Date(atividade.data);
    return dataAtividade.toDateString() === hoje.toDateString();
  });

  useEffect(() => {
    if (user?.id) {
      calcularProgresso(hoje);
    }
  }, [user?.id, calcularProgresso]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await calcularProgresso(hoje);
    }
    setRefreshing(false);
  };

  const handleToggleAtividade = async (atividadeId: string, concluida: boolean) => {
    try {
      await toggleConclusao(atividadeId, !concluida);
      // Recalcula o progresso após a mudança
      if (user?.id) {
        calcularProgresso(hoje);
      }
    } catch (error) {
      console.error('Erro ao alterar status da atividade:', error);
    }
  };

  const getMotivationalMessage = (percentual: number) => {
    if (percentual === 100) return "🎉 Parabéns! Você completou todas as atividades!";
    if (percentual >= 75) return "💪 Quase lá! Continue assim!";
    if (percentual >= 50) return "🚀 Você está no meio do caminho!";
    if (percentual >= 25) return "⚡ Bom começo! Mantenha o ritmo!";
    return "🎯 É hora de começar! Você consegue!";
  };

  const renderProgressBar = () => {
    const percentual = progresso?.percentualConclusao || 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progresso de Hoje</Text>
          <Text style={styles.progressPercentage}>{percentual}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentual}%` }]} />
        </View>
        
        <Text style={styles.progressStats}>
          {progresso?.atividadesConcluidas || 0} de {progresso?.totalAtividades || 0} atividades
        </Text>
        
        <Text style={styles.motivationalMessage}>
          {getMotivationalMessage(percentual)}
        </Text>
      </View>
    );
  };

  const renderAtividadeItem = (atividade: Atividade) => (
    <TouchableOpacity
      key={atividade.id}
      style={[styles.atividadeItem, atividade.concluida && styles.atividadeConcluida]}
      onPress={() => handleToggleAtividade(atividade.id, atividade.concluida)}
    >
      <View style={styles.atividadeContent}>
        <Text style={[
          styles.atividadeTitulo,
          atividade.concluida && styles.atividadeTituloConcluida
        ]}>
          {atividade.titulo}
        </Text>
        {atividade.descricao ? (
          <Text style={[
            styles.atividadeDescricao,
            atividade.concluida && styles.atividadeDescricaoConcluida
          ]}>
            {atividade.descricao}
          </Text>
        ) : null}
      </View>
      
      <View style={[
        styles.checkbox,
        atividade.concluida && styles.checkboxConcluida
      ]}>
        {atividade.concluida && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Olá, {user?.displayName || 'Usuário'}! 👋
        </Text>
        <Text style={styles.dateText}>
          {hoje.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {renderProgressBar()}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atividades de Hoje</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('Activities')}
          >
            <Text style={styles.addButtonText}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {atividadesLoading ? (
          <Text style={styles.loadingText}>Carregando atividades...</Text>
        ) : atividadesHoje.length > 0 ? (
          <View style={styles.atividadesList}>
            {atividadesHoje.map(renderAtividadeItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhuma atividade para hoje 📅
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('Activities')}
            >
              <Text style={styles.createFirstButtonText}>
                Criar primeira atividade
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={styles.quickActionText}>Calendário</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Activities')}
        >
          <Text style={styles.quickActionIcon}>📝</Text>
          <Text style={styles.quickActionText}>Atividades</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.quickActionIcon}>👤</Text>
          <Text style={styles.quickActionText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  progressContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressStats: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  motivationalMessage: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  atividadesList: {
    gap: 10,
  },
  atividadeItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  atividadeConcluida: {
    opacity: 0.7,
    backgroundColor: '#f0f8f0',
  },
  atividadeContent: {
    flex: 1,
  },
  atividadeTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  atividadeTituloConcluida: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  atividadeDescricao: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  atividadeDescricaoConcluida: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxConcluida: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 15,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default HomeScreen;
