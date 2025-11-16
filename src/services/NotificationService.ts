import PushNotification, { Importance } from 'react-native-push-notification';
import { messaging } from '../config/firebase';

/**
 * Serviço de Notificações
 * Gerencia notificações locais e remotas (Firebase Cloud Messaging)
 */
class NotificationService {
  constructor() {
    this.configurarNotificacoesLocais();
    this.configurarFCM();
  }

  /**
   * Configura as notificações locais
   */
  private configurarNotificacoesLocais() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificaiton.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

    // Criar canal de notificação para Android
    PushNotification.createChannel(
      {
        channelId: 'atividades-canal',
        channelName: 'Atividades',
        channelDescription: 'Notificações de atividades e lembretes',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Canal criado: ${created}`)
    );
  }

  /**
   * Configura o Firebase Cloud Messaging
   */
  private async configurarFCM() {
    try {
      // Solicita permissão para notificações
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Autorização para notificações:', authStatus);
        
        // Obtém o token de registro
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        
        // Salva o token no backend/Firestore se necessário
        // await this.salvarTokenNoServidor(token);
      }

      // Listener para quando o app está em primeiro plano
      messaging().onMessage(async (remoteMessage) => {
        console.log('Mensagem recebida em primeiro plano:', remoteMessage);
        
        // Mostrar notificação local quando em primeiro plano
        this.mostrarNotificacaoLocal(
          remoteMessage.notification?.title || 'Nova notificação',
          remoteMessage.notification?.body || '',
          remoteMessage.data
        );
      });

      // Listener para quando o app está em background
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notificação aberta do background:', remoteMessage);
        // Navegar para tela específica baseada nos dados da notificação
      });

      // Verifica se o app foi aberto por uma notificação
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log('App aberto por notificação:', remoteMessage);
            // Navegar para tela específica
          }
        });

    } catch (error) {
      console.error('Erro ao configurar FCM:', error);
    }
  }

  /**
   * Agenda uma notificação local
   */
  agendarNotificacaoLocal(
    titulo: string,
    mensagem: string,
    data: Date,
    id?: string
  ) {
    PushNotification.localNotificationSchedule({
      id: id || Math.random().toString(),
      title: titulo,
      message: mensagem,
      date: data,
      channelId: 'atividades-canal',
      soundName: 'default',
      playSound: true,
      vibrate: true,
      actions: ['Ver', 'Adiar'],
    });
  }

  /**
   * Mostra uma notificação local imediata
   */
  mostrarNotificacaoLocal(titulo: string, mensagem: string, dados?: any) {
    PushNotification.localNotification({
      title: titulo,
      message: mensagem,
      channelId: 'atividades-canal',
      soundName: 'default',
      playSound: true,
      vibrate: true,
      userInfo: dados,
    });
  }

  /**
   * Agenda lembrete para uma atividade
   */
  agendarLembreteAtividade(
    atividadeId: string,
    titulo: string,
    dataLembrete: Date
  ) {
    this.agendarNotificacaoLocal(
      'Lembrete de Atividade',
      `Não esqueça: ${titulo}`,
      dataLembrete,
      `atividade_${atividadeId}`
    );
  }

  /**
   * Cancela uma notificação agendada
   */
  cancelarNotificacao(id: string) {
    PushNotification.cancelLocalNotifications({ id });
  }

  /**
   * Cancela todas as notificações
   */
  cancelarTodasNotificacoes() {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Agenda notificação diária de motivação
   */
  agendarNotificacaoDiaria(hora: number, minuto: number) {
    const agora = new Date();
    const proximaNotificacao = new Date();
    proximaNotificacao.setHours(hora, minuto, 0, 0);

    // Se a hora já passou hoje, agenda para amanhã
    if (proximaNotificacao <= agora) {
      proximaNotificacao.setDate(proximaNotificacao.getDate() + 1);
    }

    this.agendarNotificacaoLocal(
      'Hora de ser produtivo! 💪',
      'Confira suas atividades de hoje e mantenha o foco!',
      proximaNotificacao,
      'motivacao_diaria'
    );
  }

  /**
   * Obtém o token FCM atual
   */
  async obterTokenFCM(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
      return null;
    }
  }

  /**
   * Inscreve o usuário em um tópico
   */
  async inscreverEmTopico(topico: string) {
    try {
      await messaging().subscribeToTopic(topico);
      console.log(`Inscrito no tópico: ${topico}`);
    } catch (error) {
      console.error('Erro ao se inscrever no tópico:', error);
    }
  }

  /**
   * Desinscreve o usuário de um tópico
   */
  async desinscreverDeTopico(topico: string) {
    try {
      await messaging().unsubscribeFromTopic(topico);
      console.log(`Desinscrito do tópico: ${topico}`);
    } catch (error) {
      console.error('Erro ao se desinscrever do tópico:', error);
    }
  }
}

export default new NotificationService();
