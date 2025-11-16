// ARQUIVO DE EXEMPLO - NÃO COMITAR!
// Copie este arquivo como firebase.config.ts e adicione suas credenciais

export const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com", 
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

// Como obter essas credenciais:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou selecione um existente
// 3. Adicione um app da web ao projeto
// 4. Copie as configurações fornecidas
// 5. Cole aqui substituindo os valores de exemplo

// Serviços necessários no Firebase Console:
// - Authentication (habilitar email/senha)
// - Firestore Database (modo de teste inicialmente)
// - Storage (regras permissivas para testes)
// - Cloud Messaging (opcional, para notificações)
