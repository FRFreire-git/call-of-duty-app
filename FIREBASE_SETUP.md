# 🔥 Configuração do Firebase - Bundle ID

## 📱 Bundle ID para iOS

Para registrar seu app iOS no Firebase, você precisa do **Bundle ID**. No nosso projeto Expo, o Bundle ID está configurado em:

### Localização do Bundle ID:
- **Arquivo**: `app.json`
- **Caminho**: `expo.ios.bundleIdentifier`
- **Valor atual**: `com.callofdutyapp.activities`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.callofdutyapp.activities"
    },
    "android": {
      "package": "com.callofdutyapp.activities"
    }
  }
}
```

## 🚀 Como configurar no Firebase Console

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com
- Selecione seu projeto

### 2. Adicionar app iOS
1. Clique em "Adicionar app"
2. Selecione o ícone do iOS
3. **Bundle ID**: `com.callofdutyapp.activities`
4. **Nome do app**: Call Of Duty App
5. **App Store ID**: (opcional por enquanto)

### 3. Baixar GoogleService-Info.plist
1. Após registrar, baixe o arquivo `GoogleService-Info.plist`
2. **IMPORTANTE**: Coloque o arquivo na raiz do projeto (mesmo nível que `App.tsx`)

### 4. Adicionar app Android
1. Clique em "Adicionar app"
2. Selecione o ícone do Android
3. **Package name**: `com.callofdutyapp.activities`
4. **Nome do app**: Call Of Duty App
5. **Certificado SHA-1**: (pode deixar em branco por enquanto)

### 5. Baixar google-services.json
1. Após registrar, baixe o arquivo `google-services.json`
2. **IMPORTANTE**: Coloque o arquivo na raiz do projeto (mesmo nível que `App.tsx`)

## 📁 Estrutura de arquivos após configuração

```
CallOfDutyApp/
├── App.tsx
├── GoogleService-Info.plist    # ← iOS
├── google-services.json        # ← Android
├── app.json
└── src/
```

## ⚠️ Importante

- **NUNCA** commite os arquivos `GoogleService-Info.plist` e `google-services.json` no Git
- Eles já estão no `.gitignore`
- Cada desenvolvedor deve baixar seus próprios arquivos do Firebase Console

## 🔧 Próximos passos

1. ✅ Bundle ID configurado: `com.callofdutyapp.activities`
2. ⏳ Registrar no Firebase Console
3. ⏳ Baixar arquivos de configuração
4. ⏳ Habilitar Authentication, Firestore e Storage
5. ⏳ Configurar regras de segurança

## 🆘 Problemas comuns

### Bundle ID já em uso
Se o Bundle ID `com.callofdutyapp.activities` já estiver em uso, você pode alterar para:
- `com.seudominio.callofdutyapp`
- `com.callofdutyapp.activities.dev`
- `com.callofdutyapp.activities.v2`

### Alterar Bundle ID
Para alterar o Bundle ID, edite o arquivo `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.seudominio.callofdutyapp"
    },
    "android": {
      "package": "com.seudominio.callofdutyapp"
    }
  }
}
```

## 📞 Suporte

Se tiver dúvidas, consulte:
- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação Expo](https://docs.expo.dev)
- [React Native Firebase](https://rnfirebase.io)
