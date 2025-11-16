import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useAuth } from '../hooks/useAuth';
import { useAtividades } from '../hooks/useAtividades';
import AtividadeService from '../services/AtividadeService';
import { Atividade } from '../models/Atividade';

/**
 * Tela do Calendário
 * Integra com react-native-calendars e mostra atividades por data
 */
const CalendarScreen: React.FC = () => {
  const { user } = useAuth();
  const { atividades, toggleConclusao } = useAtividades(user?.id);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [atividadesDodia, setAtividadesDodia] = useState<Atividade[]>([]);
  const [progressoMensal, setProgressoMensal] = useState<{[key: string]: any}>({});

  // Prepara os dados do calendário com marcadores de progresso
  const markedDates = useMemo(() => {
    const marked: {[key: string]: any} = {};
    
    // Agrupa atividades por data
    const atividadesPorData: {[key: string]: Atividade[]} = {};
    atividades.forEach(atividade => {
      const dataStr = new Date(atividade.data).toISOString().split('T')[0];
      if (!atividadesPorData[dataStr]) {
        atividadesPorData[dataStr] = [];
      }
      atividadesPorData[dataStr].push(atividade);
    });

    // Calcula progresso para cada dia e marca no calendário
    Object.keys(atividadesPorData).forEach(dataStr => {
      const atividadesDoDia = atividadesPorData[dataStr];
      const total = atividadesDoDia.length;
      const concluidas = atividadesDoDia.filter(a => a.concluida).length;
      const percentual = total > 0 ? (concluidas / total) * 100 : 0;
      
      let color = '#E0E0E0'; // Cinza para dias sem atividades
      let textColor = '#666';
      
      if (percentual === 100) {
        color = '#4CAF50'; // Verde para 100%
        textColor = 'white';
      } else if (percentual >= 75) {
        color = '#8BC34A'; // Verde claro para 75%+
        textColor = 'white';
      } else if (percentual >= 50) {
        color = '#FFC107'; // Amarelo para 50%+
        textColor = 'black';
      } else if (percentual > 0) {
        color = '#FF9800'; // Laranja para algum progresso
        textColor = 'white';
      }

      marked[dataStr] = {
        marked: true,
        dotColor: color,
        activeOpacity: 0.7,
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 16,
          },
          text: {
            color: textColor,
            fontWeight: 'bold',
          },
        },
      };
    });

    // Marca o dia selecionado
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
      selectedTextColor: 'white',
    };

    return marked;
  }, [atividades, selectedDate]);

  // Carrega atividades do dia selecionado
  useEffect(() => {
    const carregarAtividadesDoDia = async () => {
      if (!user?.id) return;
      
      try {
        const data = new Date(selectedDate);
        const atividadesDoDia = await AtividadeService.buscarAtividadesPorData(user.id, data);
        setAtividadesDodia(atividadesDoDia);
      } catch (error) {
        console.error('Erro ao carregar atividades do dia:', error);
      }
    };

    carregarAtividadesDoDia();
  }, [selectedDate, user?.id]);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleToggleAtividade = async (atividadeId: string, concluida: boolean) => {
    try {
      await toggleConclusao(atividadeId, !concluida);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status da atividade');
    }
  };

  const getProgressoParaDia = (dataStr: string) => {
    const atividadesDoDia = atividades.filter(atividade => {
      return new Date(atividade.data).toISOString().split('T')[0] === dataStr;
    });
    
    const total = atividadesDoDia.length;
    const concluidas = atividadesDoDia.filter(a => a.concluida).length;
    
    return { total, concluidas, percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0 };
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
        <View style={styles.atividadeMeta}>
          <Text style={styles.atividadeCategoria}>
            {atividade.categoria}
          </Text>
          <Text style={[
            styles.atividadePrioridade,
            { color: atividade.prioridade === 'alta' ? '#F44336' : 
                     atividade.prioridade === 'media' ? '#FF9800' : '#4CAF50' }
          ]}>
            {atividade.prioridade}
          </Text>
        </View>
      </View>
      
      <View style={[
        styles.checkbox,
        atividade.concluida && styles.checkboxConcluida
      ]}>
        {atividade.concluida && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  const progressoDiaAtual = getProgressoParaDia(selectedDate);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          markingType="custom"
          theme={{
            backgroundColor: 'white',
            calendarBackground: 'white',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#007AFF',
            selectedDotColor: '#ffffff',
            arrowColor: '#007AFF',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2d4150',
            indicatorColor: '#007AFF',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>

      <View style={styles.legendaContainer}>
        <Text style={styles.legendaTitle}>Legenda</Text>
        <View style={styles.legendaItems}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendaText}>100% concluído</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaDot, { backgroundColor: '#8BC34A' }]} />
            <Text style={styles.legendaText}>75%+ concluído</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaDot, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendaText}>50%+ concluído</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendaText}>Em progresso</Text>
          </View>
        </View>
      </View>

      <View style={styles.detalhesContainer}>
        <View style={styles.detalhesHeader}>
          <Text style={styles.detalhesData}>
            {new Date(selectedDate).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          {progressoDiaAtual.total > 0 && (
            <View style={styles.progressoTag}>
              <Text style={styles.progressoText}>
                {progressoDiaAtual.concluidas}/{progressoDiaAtual.total} ({progressoDiaAtual.percentual}%)
              </Text>
            </View>
          )}
        </View>

        {atividadesDodia.length > 0 ? (
          <View style={styles.atividadesList}>
            {atividadesDodia.map(renderAtividadeItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhuma atividade para este dia 📅
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Toque em "Atividades" para adicionar uma nova
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendaContainer: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  legendaItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    width: '48%',
  },
  legendaDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendaText: {
    fontSize: 12,
    color: '#666',
  },
  detalhesContainer: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detalhesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detalhesData: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
    flex: 1,
  },
  progressoTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  progressoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  atividadesList: {
    gap: 10,
  },
  atividadeItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
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
    marginBottom: 4,
  },
  atividadeTituloConcluida: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  atividadeDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  atividadeDescricaoConcluida: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  atividadeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atividadeCategoria: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  atividadePrioridade: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CalendarScreen;
