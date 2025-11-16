import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../types';
import AtividadeService from '../../services/AtividadeService';
import { Atividade } from '../../models/Atividade';
import { useAtividades } from '../../hooks/useAtividades';
import { useAuth } from '../../hooks/useAuth';

type ActivityDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActivityDetails'>;
type ActivityDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ActivityDetails'>;

interface Props {
  navigation: ActivityDetailsScreenNavigationProp;
  route: ActivityDetailsScreenRouteProp;
}

/**
 * Tela de Detalhes da Atividade
 * Mostra informações completas e permite ações
 */
const ActivityDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { activityId } = route.params;
  const { user } = useAuth();
  const { toggleConclusao, deletarAtividade } = useAtividades(user?.id);
  
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAtividade();
  }, [activityId]);

  const carregarAtividade = async () => {
    try {
      const atividadeCarregada = await AtividadeService.buscarAtividadePorId(activityId);
      setAtividade(atividadeCarregada);
    } catch (error) {
      console.error('Erro ao carregar atividade:', error);
      Alert.alert('Erro', 'Não foi possível carregar a atividade');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConclusao = async () => {
    if (!atividade) return;

    try {
      await toggleConclusao(atividade.id, !atividade.concluida);
      setAtividade({ ...atividade, concluida: !atividade.concluida });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status da atividade');
    }
  };

  const handleEditar = () => {
    // TODO: Implementar navegação para edição
    Alert.alert('Em desenvolvimento', 'Funcionalidade de edição será implementada em breve');
  };

  const handleExcluir = () => {
    if (!atividade) return;

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${atividade.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarAtividade(atividade.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a atividade');
            }
          }
        },
      ]
    );
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '#F44336';
      case 'media': return '#FF9800';
      case 'baixa': return '#4CAF50';
      default: return '#999';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'trabalho': return '#2196F3';
      case 'pessoal': return '#9C27B0';
      case 'exercicio': return '#FF5722';
      case 'estudo': return '#795548';
      case 'lazer': return '#607D8B';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!atividade) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Atividade não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                atividade.concluida ? styles.statusButtonConcluida : styles.statusButtonPendente
              ]}
              onPress={handleToggleConclusao}
            >
              <Icon 
                name={atividade.concluida ? 'checkmark-circle' : 'ellipse-outline'} 
                size={24} 
                color={atividade.concluida ? '#4CAF50' : '#999'} 
              />
              <Text style={[
                styles.statusText,
                atividade.concluida ? styles.statusTextConcluida : styles.statusTextPendente
              ]}>
                {atividade.concluida ? 'Concluída' : 'Pendente'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditar}>
              <Icon name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExcluir}>
              <Icon name="trash-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={[
            styles.titulo,
            atividade.concluida && styles.tituloConcluido
          ]}>
            {atividade.titulo}
          </Text>
        </View>

        {atividade.descricao ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={[
              styles.descricao,
              atividade.concluida && styles.textoConcluido
            ]}>
              {atividade.descricao}
            </Text>
          </View>
        ) : null}

        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Icon name="calendar-outline" size={20} color="#666" />
            <Text style={styles.metadataText}>
              {new Date(atividade.data).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.metadataItem}>
            <Icon name="time-outline" size={20} color="#666" />
            <Text style={styles.metadataText}>
              {new Date(atividade.data).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.metadataItem}>
            <View style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(atividade.categoria) }
            ]}>
              <Text style={styles.categoryText}>{atividade.categoria}</Text>
            </View>
          </View>

          <View style={styles.metadataItem}>
            <View style={[
              styles.priorityTag,
              { backgroundColor: getPriorityColor(atividade.prioridade) }
            ]}>
              <Text style={styles.priorityText}>{atividade.prioridade} prioridade</Text>
            </View>
          </View>
        </View>

        <View style={styles.timestampsContainer}>
          <View style={styles.timestampItem}>
            <Text style={styles.timestampLabel}>Criada em:</Text>
            <Text style={styles.timestampValue}>
              {new Date(atividade.createdAt).toLocaleDateString('pt-BR')} às{' '}
              {new Date(atividade.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {atividade.updatedAt && atividade.updatedAt !== atividade.createdAt && (
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>Última atualização:</Text>
              <Text style={styles.timestampValue}>
                {new Date(atividade.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(atividade.updatedAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flex: 1,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  statusButtonConcluida: {
    backgroundColor: '#E8F5E8',
  },
  statusButtonPendente: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusTextConcluida: {
    color: '#4CAF50',
  },
  statusTextPendente: {
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  titleContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 30,
  },
  tituloConcluido: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descricao: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  textoConcluido: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metadataContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    gap: 15,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
    textTransform: 'capitalize',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  priorityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  priorityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  timestampsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    gap: 10,
  },
  timestampItem: {
    marginBottom: 5,
  },
  timestampLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  timestampValue: {
    fontSize: 14,
    color: '#666',
  },
});

export default ActivityDetailsScreen;
