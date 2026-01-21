# Guia de Instalação - APP Valet

## Pré-requisitos

### Geral
- Node.js 16+ ou superior
- npm ou yarn
- Git

### Backend
- PostgreSQL 12+
- Conta Twilio (para SMS)
- Conta Google Cloud (para OCR)

### Frontend (Mobile)
- Expo CLI (`npm install -g expo-cli`)
- iOS: macOS + Xcode (opcional)
- Android: Android Studio + Android SDK

---

## 1️⃣ Instalação do Backend

### 1.1 Clonar e Acessar o Projeto

```bash
cd backend
```

### 1.2 Instalar Dependências

```bash
npm install
```

### 1.3 Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/app_valet

# JWT
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
JWT_EXPIRY=7d

# Twilio (SMS)
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=+55119987654321

# Google Cloud Vision (OCR)
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLOUD_KEY_PATH=./config/google-cloud-key.json

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# Logging
LOG_LEVEL=info
```

### 1.4 Configurar Banco de Dados

#### PostgreSQL

```bash
# No terminal/cmd do PostgreSQL
createdb app_valet
```

#### Prisma (Recomendado)

```bash
# Instalar Prisma
npm install -D prisma

# Inicializar Prisma
npx prisma init

# Executar migrations
npx prisma migrate dev --name init

# Abrir Prisma Studio (interface visual)
npx prisma studio
```

Ou execute o SQL do arquivo [DATABASE.md](DATABASE.md) diretamente no PostgreSQL:

```bash
psql -U user -d app_valet -f database-schema.sql
```

### 1.5 Configurar Chaves de Serviços

#### Google Cloud Vision (OCR)

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto novo
3. Ative a Vision API
4. Crie uma conta de serviço
5. Baixe a chave JSON e salve em `backend/config/google-cloud-key.json`

#### Twilio (SMS)

1. Acesse [Twilio](https://www.twilio.com)
2. Crie uma conta
3. Obtenha seu Account SID e Auth Token
4. Compre um número de telefone
5. Copie essas informações para `.env`

### 1.6 Iniciar o Servidor

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

Server rodará em `http://localhost:3000`

---

## 2️⃣ Instalação do Frontend (Mobile)

### 2.1 Acessar a Pasta Frontend

```bash
cd frontend
```

### 2.2 Instalar Dependências

```bash
npm install
```

### 2.3 Configurar Variáveis de Ambiente

Crie um arquivo `.env` ou defina em `app.json`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 2.4 Iniciar o App

```bash
# Iniciar Expo (abre menu interativo)
npm start

# Ou direto:
npm run web      # Web
npm run ios      # iOS
npm run android  # Android
```

---

## 🔑 Teste de Login (Mock)

Use as credenciais padrão:

```
Email: admin@valet.com
Senha: password123
Código da Chave: (qualquer código)
```

---

## 🧪 Testes

### Backend

```bash
npm test
```

### Frontend

```bash
npm test
```

---

## 📱 Build para Produção

### Backend

```bash
npm run build
npm start
```

### Frontend - iOS

```bash
eas build --platform ios
```

### Frontend - Android

```bash
eas build --platform android
```

---

## 🐛 Troubleshooting

### Backend não conecta ao banco

```bash
# Verificar conexão
psql -U user -h localhost -d app_valet

# Checar .env DATABASE_URL
# Formato: postgresql://user:password@host:port/database
```

### SMS não envia

- Verificar credenciais Twilio
- Número de telefone no formato internacional (+55...)
- Saldo na conta Twilio

### OCR não reconhece placa

- Verificar qualidade da imagem
- Google Cloud Vision configurado corretamente
- Arquivo de chave JSON no caminho correto

### Erro CORS no frontend

- Adicionar URL do frontend em `ALLOWED_ORIGINS` no `.env`
- Reiniciar servidor backend

---

## 📚 Próximos Passos

1. Implementar autenticação real com banco de dados
2. Integrar Prisma ORM
3. Adicionar mais testes
4. Implementar relatórios mais detalhados
5. Adicionar suporte a notificações push
6. Temas e internacionalização (i18n)

---

## 📖 Documentação

- [API Endpoints](API.md)
- [Database Schema](DATABASE.md)
- [Arquitectura](../README.md)

