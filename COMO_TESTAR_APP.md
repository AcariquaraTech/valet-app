# 📱 Como Testar o App no Seu Celular

## 🚀 Opção 1: Expo Go (MAIS RÁPIDO - RECOMENDADO)

### 1. Instale o Expo Go no seu celular
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

### 2. Conecte seu celular na MESMA REDE Wi-Fi do computador

### 3. Inicie o frontend
```powershell
cd frontend
npm start
```

### 4. Escaneie o QR Code
- **Android**: Abra Expo Go e escaneie o QR
- **iOS**: Abra a câmera e escaneie o QR

### 5. Pronto! App vai abrir no seu celular 🎉

---

## 💻 Opção 2: Emulador Android

### 1. Instale Android Studio
- Download: https://developer.android.com/studio

### 2. Configure um dispositivo virtual (AVD)
- Abra Android Studio > Device Manager > Create Virtual Device

### 3. Inicie o emulador

### 4. Inicie o frontend e pressione 'a'
```powershell
cd frontend
npm start
# Pressione 'a' para abrir no Android
```

---

## 🍎 Opção 3: Simulador iOS (Apenas Mac)

### 1. Instale Xcode da App Store

### 2. Inicie o frontend e pressione 'i'
```powershell
cd frontend
npm start
# Pressione 'i' para abrir no iOS
```

---

## 📦 Opção 4: Gerar APK para Instalar no Android

### 1. Configure EAS (Expo Application Services)
```powershell
npm install -g eas-cli
eas login
```

### 2. Configure o projeto
```powershell
cd frontend
eas build:configure
```

### 3. Gere o APK
```powershell
eas build --platform android --profile preview
```

### 4. Baixe o APK e instale no celular
- O Expo vai gerar um link para download
- Transfira o APK para seu celular
- Instale (pode precisar permitir "Fontes Desconhecidas")

---

## 🔧 Seu Setup Atual

### Backend
- ✅ Rodando em: http://172.29.64.1:3000
- ✅ Banco: SQLite conectado
- ✅ Usuário: admin@valet.com / senha123

### Frontend
- ✅ Configurado para: http://172.29.64.1:3000/api
- ✅ Pronto para iOS/Android

---

## 🧪 Comandos Rápidos

### Iniciar Frontend
```powershell
cd frontend
npm start
```

### Limpar Cache (se der erro)
```powershell
cd frontend
expo start --clear
```

### Reinstalar (se necessário)
```powershell
cd frontend
rm -r node_modules
npm install --legacy-peer-deps
```

---

## 📱 Testando o App

1. **Login**:
   - Email: admin@valet.com
   - Senha: senha123

2. **Registrar Entrada**:
   - Adicione placa, modelo, cor
   - Dados do cliente (opcional)

3. **Ver Estacionados**:
   - Lista de veículos

4. **Registrar Saída**:
   - Selecione veículo e finalize

---

## 🐛 Problemas Comuns

### "Network request failed"
- Verifique se celular e PC estão na mesma rede Wi-Fi
- Verifique se backend está rodando
- Teste: abra http://172.29.64.1:3000/health no navegador do celular

### "Unable to resolve module"
```powershell
cd frontend
expo start --clear
```

### "Expo Go crashed"
- Atualize o Expo Go na loja
- Reinstale as dependências: `npm install`

---

## 🎯 Próximos Passos

1. ✅ Testar no Expo Go (5 min)
2. ⏳ Ajustar telas e design
3. ⏳ Adicionar mais funcionalidades
4. ⏳ Gerar APK final
5. ⏳ Publicar na Play Store/App Store

---

**Status**: Backend rodando, frontend pronto, só escanear QR! 📱✨
