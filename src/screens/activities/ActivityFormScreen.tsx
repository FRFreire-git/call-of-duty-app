import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useAtividades } from '../../hooks/useAtividades';
import { RootStackParamList, CategoriaAtividade, PrioridadeAtividade } from '../../types';
import NotificationService from '../../services/NotificationService';

type ActivityFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActivityForm'>;

interface Props {
  navigation: ActivityFormScreenNavigationProp;
}

/**
 * Tela de Formulário de Atividade
 * Permite criar/editar atividades
 */
const ActivityFormScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { criarAtividade } = useAtividades(user?.id);
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date());
  const [categoria, setCategoria] = useState<CategoriaAtividade>(CategoriaAtividade.PESSOAL);
  const [prioridade, setPrioridade] = useState<PrioridadeAtividade>(PrioridadeAtividade.MEDIA);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [agendarLembrete, setAgendarLembrete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Por favor, informe o título da atividade');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      const atividadeId = await criarAtividade({
        userId: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data,
        concluida: false,
        categoria,
        prioridade,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Agenda lembrete se solicitado
      if (agendarLembrete && data > new Date()) {
        const dataLembrete = new Date(data.getTime() - 30 * 60 * 1000); // 30 minutos antes
        NotificationService.agendarLembreteAtividade(atividadeId, titulo, dataLembrete);
      }

      Alert.alert(
        'Sucesso',
        'Atividade criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a atividade');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  const renderCategoriaSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Categoria *</Text>
      <View style={styles.optionsContainer}>
        {Object.values(CategoriaAtividade).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.optionButton,
              categoria === cat && styles.optionButtonActive,
            ]}
            onPress={() => setCategoria(cat)}
          >
            <Text style={[
              styles.optionButtonText,
              categoria === cat && styles.optionButtonTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPrioridadeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Prioridade *</Text>
      <View style={styles.optionsContainer}>
        {Object.values(PrioridadeAtividade).map((prior) => (
          <TouchableOpacity
            key={prior}
            style={[
              styles.optionButton,
              prioridade === prior && styles.optionButtonActive,
              { borderColor: prior === 'alta' ? '#F44336' : 
                            prior === 'media' ? '#FF9800' : '#4CAF50' }
            ]}
            onPress={() => setPrioridade(prior)}
          >
            <Text style={[
              styles.optionButtonText,
              prioridade === prior && styles.optionButtonTextActive,
            ]}>
              {prior}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o título da atividade"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva a atividade (opcional)"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data e Hora *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {data.toLocaleDateString('pt-BR')} às {data.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode="datetime"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {renderCategoriaSelector()}
        {renderPrioridadeSelector()}

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgendarLembrete(!agendarLembrete)}
          >
            <View style={[
              styles.checkboxBox,
              agendarLembrete && styles.checkboxBoxActive
            ]}>
              {agendarLembrete && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Agendar lembrete (30 min antes)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectorContainer: {
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  optionButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginBottom: 30,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxBoxActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ActivityFormScreen;
