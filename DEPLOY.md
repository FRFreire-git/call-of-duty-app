# Guia de Deploy - Call of Duty App

## 📋 Pré-requisitos

### Para Android
- Android Studio instalado
- SDK do Android configurado
- Device/Emulador Android

### Para iOS  
- macOS com Xcode
- iOS Simulator ou device físico
- Apple Developer Account (para deploy na App Store)

### Para Web
- Nenhum pré-requisito adicional

## 🔧 Configuração Inicial

### 1. Configurar Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto (opcional, já configurado)
firebase init
```

### 2. Configurar Credenciais

1. Copie `src/config/firebase.example.ts` para `src/config/firebase.ts`
2. Substitua as credenciais pelos valores do seu projeto Firebase
3. Baixe os arquivos de configuração:
   - `google-services.json` para `android/app/`
   - `GoogleService-Info.plist` para `ios/`

### 3. Instalar Dependências

```bash
npm install --legacy-peer-deps

# Para iOS
cd ios && pod install && cd ..
```

## 🚀 Deploy de Desenvolvimento

### Expo Development Build

```bash
# Iniciar servidor de desenvolvimento
npm start

# Executar no Android
npm run android

# Executar no iOS  
npm run ios

# Executar na Web
npm run web
```

## 📱 Build de Produção

### Android APK

```bash
# Build local
cd android
./gradlew assembleRelease

# O APK estará em: android/app/build/outputs/apk/release/
```

### Android AAB (Google Play)

```bash
cd android
./gradlew bundleRelease

# O AAB estará em: android/app/build/outputs/bundle/release/
```

### iOS Archive

1. Abra o projeto no Xcode: `ios/CallOfDutyApp.xcworkspace`
2. Configure seu Team e Bundle Identifier
3. Product → Archive
4. Distribute App → App Store Connect

## ☁️ Deploy do Backend

### Cloud Functions

```bash
# Navegar para functions
cd functions

# Instalar dependências
npm install

# Deploy das functions
firebase deploy --only functions

# Deploy de regras do Firestore
firebase deploy --only firestore:rules

# Deploy de regras do Storage
firebase deploy --only storage
```

### Configurar Cloud Messaging

1. No Firebase Console → Cloud Messaging
2. Adicionar certificado APNs (iOS)
3. Configurar servidor de desenvolvimento para FCM

## 🔐 Configurações de Segurança

### Firestore Rules

Aplicar as regras do arquivo `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### Storage Rules

```bash
firebase deploy --only storage
```

### Environment Variables

Nunca commite:
- `google-services.json`
- `GoogleService-Info.plist`
- `src/config/firebase.ts` com credenciais reais

## 📊 Monitoramento

### Firebase Console

- Analytics: Acompanhar uso do app
- Crashlytics: Monitorar erros
- Performance: Analisar performance
- Remote Config: Configurações remotas

### Logs

```bash
# Ver logs das Cloud Functions
firebase functions:log

# Ver logs em tempo real
firebase functions:log --follow
```

## 🧪 Testes Antes do Deploy

### Checklist de Testes

- [ ] Login/Registro funcionando
- [ ] CRUD de atividades
- [ ] Calendário exibindo dados
- [ ] Upload de foto de perfil
- [ ] Notificações locais
- [ ] Navegação entre telas
- [ ] Tratamento de erros
- [ ] Performance em devices lentos

### Comandos de Teste

```bash
# Executar testes unitários
npm test

# Verificar tipos TypeScript
npm run type-check

# Lint do código
npm run lint

# Corrigir problemas de lint automaticamente
npm run lint:fix
```

## 📱 Publicação nas Stores

### Google Play Store

1. Criar conta de desenvolvedor
2. Configurar app listing
3. Upload do AAB
4. Configurar preços e distribuição
5. Submeter para revisão

### Apple App Store

1. App Store Connect account
2. Configurar app metadata
3. Upload via Xcode ou Application Loader
4. Submeter para revisão

## 🔄 CI/CD (Opcional)

### GitHub Actions

Exemplo de workflow:

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
```

## 🆘 Troubleshooting

### Problemas Comuns

**Metro bundler não inicia:**
```bash
npx react-native start --reset-cache
```

**Dependências incompatíveis:**
```bash
npm install --legacy-peer-deps
```

**Erro de pods (iOS):**
```bash
cd ios && pod deintegrate && pod install
```

**Firebase não conecta:**
- Verifique se as credenciais estão corretas
- Confirme que os serviços estão habilitados no Console
- Verifique se o package name/bundle ID coincide

### Logs Úteis

```bash
# Logs do React Native
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# Logs do Expo
expo logs
```

## 📞 Suporte

- Documentação React Native: https://reactnative.dev/
- Documentação Firebase: https://firebase.google.com/docs
- Expo Documentation: https://docs.expo.dev/

---

**Boa sorte com seu deploy! 🚀**
