import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { useAtividades } from '../../hooks/useAtividades';
import { MainTabParamList } from '../../types';
import { Atividade } from '../../models/Atividade';
import { CategoriaAtividade, PrioridadeAtividade } from '../../types';

type ActivitiesScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Activities'>;

/**
 * Tela de Lista de Atividades
 * CRUD completo de atividades com filtros e busca
 */
const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation<ActivitiesScreenNavigationProp>();
  const { user } = useAuth();
  const { atividades, loading, deletarAtividade, toggleConclusao } = useAtividades(user?.id);
  
  const [searchText, setSearchText] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaAtividade | 'all'>('all');
  const [filtroConcluida, setFiltroConcluida] = useState<'all' | 'concluidas' | 'pendentes'>('all');

  // Filtrar atividades
  const atividadesFiltradas = atividades.filter(atividade => {
    const matchSearch = atividade.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
                       atividade.descricao.toLowerCase().includes(searchText.toLowerCase());
    
    const matchCategoria = filtroCategoria === 'all' || atividade.categoria === filtroCategoria;
    
    const matchConcluida = filtroConcluida === 'all' ||
                          (filtroConcluida === 'concluidas' && atividade.concluida) ||
                          (filtroConcluida === 'pendentes' && !atividade.concluida);
    
    return matchSearch && matchCategoria && matchConcluida;
  });

  const handleDeleteAtividade = (atividade: Atividade) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${atividade.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deletarAtividade(atividade.id)
        },
      ]
    );
  };

  const handleToggleAtividade = async (atividade: Atividade) => {
    try {
      await toggleConclusao(atividade.id, !atividade.concluida);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status da atividade');
    }
  };

  const getPriorityColor = (prioridade: PrioridadeAtividade) => {
    switch (prioridade) {
      case PrioridadeAtividade.ALTA: return '#F44336';
      case PrioridadeAtividade.MEDIA: return '#FF9800';
      case PrioridadeAtividade.BAIXA: return '#4CAF50';
      default: return '#999';
    }
  };

  const getCategoryColor = (categoria: CategoriaAtividade) => {
    switch (categoria) {
      case CategoriaAtividade.TRABALHO: return '#2196F3';
      case CategoriaAtividade.PESSOAL: return '#9C27B0';
      case CategoriaAtividade.EXERCICIO: return '#FF5722';
      case CategoriaAtividade.ESTUDO: return '#795548';
      case CategoriaAtividade.LAZER: return '#607D8B';
      default: return '#999';
    }
  };

  const renderAtividadeItem = ({ item }: { item: Atividade }) => (
    <View style={[styles.atividadeItem, item.concluida && styles.atividadeConcluida]}>
      <TouchableOpacity
        style={styles.atividadeContent}
        onPress={() => console.log('Navegar para detalhes:', item.id)} // TODO: Implementar navegação
      >
        <View style={styles.atividadeHeader}>
          <Text style={[
            styles.atividadeTitulo,
            item.concluida && styles.textoConcluido
          ]}>
            {item.titulo}
          </Text>
          <View style={styles.atividadeActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => console.log('Editar:', item.id)} // TODO: Implementar edição
            >
              <Icon name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteAtividade(item)}
            >
              <Icon name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {item.descricao ? (
          <Text style={[
            styles.atividadeDescricao,
            item.concluida && styles.textoConcluido
          ]}>
            {item.descricao}
          </Text>
        ) : null}

        <View style={styles.atividadeMeta}>
          <View style={styles.tags}>
            <View style={[
              styles.tag,
              { backgroundColor: getCategoryColor(item.categoria) }
            ]}>
              <Text style={styles.tagText}>{item.categoria}</Text>
            </View>
            <View style={[
              styles.tag,
              { backgroundColor: getPriorityColor(item.prioridade) }
            ]}>
              <Text style={styles.tagText}>{item.prioridade}</Text>
            </View>
          </View>
          <Text style={styles.atividadeData}>
            {new Date(item.data).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.checkbox,
          item.concluida && styles.checkboxConcluida
        ]}
        onPress={() => handleToggleAtividade(item)}
      >
        {item.concluida && <Icon name="checkmark" size={16} color="white" />}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar atividades..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtros}>
        <View style={styles.filtroSection}>
          <Text style={styles.filtroLabel}>Categoria:</Text>
          <TouchableOpacity
            style={[
              styles.filtroButton,
              filtroCategoria === 'all' && styles.filtroButtonActive
            ]}
            onPress={() => setFiltroCategoria('all')}
          >
            <Text style={[
              styles.filtroButtonText,
              filtroCategoria === 'all' && styles.filtroButtonTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          {Object.values(CategoriaAtividade).map(categoria => (
            <TouchableOpacity
              key={categoria}
              style={[
                styles.filtroButton,
                filtroCategoria === categoria && styles.filtroButtonActive
              ]}
              onPress={() => setFiltroCategoria(categoria)}
            >
              <Text style={[
                styles.filtroButtonText,
                filtroCategoria === categoria && styles.filtroButtonTextActive
              ]}>
                {categoria}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filtroSection}>
          <Text style={styles.filtroLabel}>Status:</Text>
          {[
            { key: 'all', label: 'Todas' },
            { key: 'pendentes', label: 'Pendentes' },
            { key: 'concluidas', label: 'Concluídas' },
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filtroButton,
                filtroConcluida === item.key && styles.filtroButtonActive
              ]}
              onPress={() => setFiltroConcluida(item.key as any)}
            >
              <Text style={[
                styles.filtroButtonText,
                filtroConcluida === item.key && styles.filtroButtonTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={atividadesFiltradas}
        renderItem={renderAtividadeItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="clipboard-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {searchText || filtroCategoria !== 'all' || filtroConcluida !== 'all'
                ? 'Nenhuma atividade encontrada'
                : 'Nenhuma atividade cadastrada'
              }
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => console.log('Criar atividade')} // TODO: Implementar navegação
            >
              <Text style={styles.createButtonText}>
                {searchText || filtroCategoria !== 'all' || filtroConcluida !== 'all'
                  ? 'Limpar filtros'
                  : 'Criar primeira atividade'
                }
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => console.log('Criar nova atividade')} // TODO: Implementar navegação
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtros: {
    gap: 15,
  },
  filtroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filtroLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  filtroButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtroButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filtroButtonText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  filtroButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  atividadeItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  atividadeConcluida: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
  },
  atividadeContent: {
    flex: 1,
    marginRight: 10,
  },
  atividadeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  atividadeTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  textoConcluido: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  atividadeActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    padding: 5,
  },
  atividadeDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  atividadeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  atividadeData: {
    fontSize: 12,
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
    marginTop: 5,
  },
  checkboxConcluida: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default ActivitiesScreen;
