/**
 * Cloud Function para envio de notificações remotas
 * Deploy: firebase deploy --only functions
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Função para enviar notificação quando uma atividade é criada
 */
exports.enviarNotificacaoAtividadeCriada = functions.firestore
  .document('atividades/{atividadeId}')
  .onCreate(async (snap, context) => {
    const atividade = snap.data();
    const { titulo, userId } = atividade;

    try {
      // Busca dados do usuário
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData || !userData.fcmToken) {
        console.log('Token FCM não encontrado para o usuário:', userId);
        return null;
      }

      // Monta a mensagem de notificação
      const message = {
        notification: {
          title: 'Nova Atividade Criada! 🎯',
          body: `"${titulo}" foi adicionada à sua lista`,
        },
        data: {
          type: 'atividade_criada',
          atividadeId: context.params.atividadeId,
          userId: userId,
        },
        token: userData.fcmToken,
      };

      // Envia a notificação
      const response = await admin.messaging().send(message);
      console.log('Notificação enviada com sucesso:', response);

      return response;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return null;
    }
  });

/**
 * Função para enviar notificação quando uma atividade é completada
 */
exports.enviarNotificacaoAtividadeConcluida = functions.firestore
  .document('atividades/{atividadeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Verifica se a atividade foi marcada como concluída
    if (!before.concluida && after.concluida) {
      const { titulo, userId } = after;

      try {
        // Busca dados do usuário
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData || !userData.fcmToken) {
          console.log('Token FCM não encontrado para o usuário:', userId);
          return null;
        }

        // Monta a mensagem de notificação
        const message = {
          notification: {
            title: 'Parabéns! 🎉',
            body: `Você completou: "${titulo}"`,
          },
          data: {
            type: 'atividade_concluida',
            atividadeId: context.params.atividadeId,
            userId: userId,
          },
          token: userData.fcmToken,
        };

        // Envia a notificação
        const response = await admin.messaging().send(message);
        console.log('Notificação de conclusão enviada:', response);

        return response;
      } catch (error) {
        console.error('Erro ao enviar notificação de conclusão:', error);
        return null;
      }
    }

    return null;
  });

/**
 * Função para enviar notificações de motivação diária
 */
exports.enviarNotificacaoMotivacionalDiaria = functions.pubsub
  .schedule('0 9 * * *') // Todo dia às 9:00 AM (UTC)
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      // Busca todos os usuários com tokens FCM
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('fcmToken', '!=', null)
        .get();

      const messages = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Verifica quantas atividades o usuário tem para hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        const atividadesSnapshot = await admin.firestore()
          .collection('atividades')
          .where('userId', '==', userDoc.id)
          .where('data', '>=', hoje)
          .where('data', '<', amanha)
          .get();

        const totalAtividades = atividadesSnapshot.size;
        const atividadesPendentes = atividadesSnapshot.docs.filter(
          doc => !doc.data().concluida
        ).length;

        let title = 'Bom dia! ☀️';
        let body = 'Que tal começar o dia sendo produtivo?';

        if (totalAtividades > 0) {
          if (atividadesPendentes === 0) {
            title = 'Parabéns! 🎉';
            body = 'Você já completou todas as atividades de hoje!';
          } else {
            title = 'Vamos lá! 💪';
            body = `Você tem ${atividadesPendentes} atividade${atividadesPendentes > 1 ? 's' : ''} pendente${atividadesPendentes > 1 ? 's' : ''} para hoje`;
          }
        }

        messages.push({
          notification: {
            title,
            body,
          },
          data: {
            type: 'motivacao_diaria',
            totalAtividades: totalAtividades.toString(),
            atividadesPendentes: atividadesPendentes.toString(),
          },
          token: userData.fcmToken,
        });
      }

      // Envia todas as notificações em lote
      if (messages.length > 0) {
        const response = await admin.messaging().sendEach(messages);
        console.log(`Notificações motivacionais enviadas: ${response.successCount}/${messages.length}`);
        
        // Log dos erros se houver
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`Erro ao enviar para ${messages[idx].token}:`, resp.error);
            }
          });
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao enviar notificações motivacionais:', error);
      return null;
    }
  });

/**
 * Função para limpar tokens FCM inválidos
 */
exports.limparTokensInvalidos = functions.pubsub
  .schedule('0 2 * * 0') // Todo domingo às 2:00 AM
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('fcmToken', '!=', null)
        .get();

      const tokensParaTestar = [];
      const userTokenMap = {};

      usersSnapshot.forEach(doc => {
        const token = doc.data().fcmToken;
        tokensParaTestar.push(token);
        userTokenMap[token] = doc.id;
      });

      if (tokensParaTestar.length === 0) {
        console.log('Nenhum token para testar');
        return null;
      }

      // Testa os tokens enviando uma mensagem de teste
      const message = {
        data: {
          type: 'test',
        },
        tokens: tokensParaTestar,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Remove tokens inválidos
      const batch = admin.firestore().batch();
      let removidos = 0;

      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          if (errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered') {
            const token = tokensParaTestar[idx];
            const userId = userTokenMap[token];
            
            const userRef = admin.firestore().collection('users').doc(userId);
            batch.update(userRef, { fcmToken: admin.firestore.FieldValue.delete() });
            removidos++;
            
            console.log(`Token inválido removido para usuário ${userId}`);
          }
        }
      });

      if (removidos > 0) {
        await batch.commit();
        console.log(`Removidos ${removidos} tokens inválidos`);
      }

      return null;
    } catch (error) {
      console.error('Erro ao limpar tokens inválidos:', error);
      return null;
    }
  });

/**
 * Função para salvar token FCM do usuário
 */
exports.salvarTokenFCM = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { token } = data;
  const userId = context.auth.uid;

  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'Token FCM é obrigatório');
  }

  try {
    await admin.firestore().collection('users').doc(userId).update({
      fcmToken: token,
      fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar token FCM:', error);
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
});
