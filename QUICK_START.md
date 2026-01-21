# ⚡ Quick Start - APP Valet

## 🚀 Iniciar em 5 Minutos

### 1. Backend

```bash
# Entrar na pasta
cd backend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# EDITAR .env com suas credenciais:
# - DATABASE_URL (PostgreSQL)
# - JWT_SECRET
# - TWILIO_*
# - GOOGLE_CLOUD_*

# Iniciar servidor
npm run dev
```

✅ Backend rodando em `http://localhost:3000`

### 2. Frontend

```bash
# Em outro terminal, entrar na pasta
cd frontend

# Instalar dependências
npm install

# Iniciar Expo
npm start

# Escolher:
# - w para Web
# - a para Android
# - i para iOS
```

✅ App rodando em Expo

---

## 🧪 Testar com Mock Data

### Credenciais Padrão
```
Email: admin@valet.com
Senha: password123
Chave: qualquer_chave
```

### Endpoints Disponíveis

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@valet.com",
    "password": "password123",
    "accessKeyCode": "ABC123"
  }'
```

**Entrada de Veículo**
```bash
curl -X POST http://localhost:3000/api/vehicles/entry \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "ABC-1234",
    "client_name": "João",
    "client_phone": "11987654321"
  }'
```

---

## 📁 Estrutura Principal

```
APP VALLET/
├── backend/          ← API Node.js
├── frontend/         ← App React Native
├── docs/             ← Documentação
├── README.md         ← Visão geral
├── CHECKLIST.md      ← Fases de desenvolvimento
└── RESUMO_EXECUTIVO.md ← Este arquivo
```

---

## 📚 Documentação

1. **[README.md](README.md)** - Visão geral do projeto
2. **[docs/API.md](docs/API.md)** - Todos os endpoints
3. **[docs/DATABASE.md](docs/DATABASE.md)** - Schema do banco
4. **[docs/SETUP.md](docs/SETUP.md)** - Instalação detalhada
5. **[docs/FLUXOS.md](docs/FLUXOS.md)** - Diagramas de fluxo
6. **[CHECKLIST.md](CHECKLIST.md)** - Phases de development

---

## 🔑 Funcionalidades Principais

✅ **Autenticação** - Login com JWT  
✅ **Entrada/Saída** - Registrar veículos  
✅ **SMS** - Notificar cliente  
✅ **OCR** - Reconhecer placa  
✅ **Relatórios** - Movimento do dia  
✅ **Usuários** - Gerenciar operadores  
✅ **Chaves** - Múltiplos acessos  

---

## 🛠️ Próximas Etapas

1. [ ] Configurar PostgreSQL
2. [ ] Adicionar credenciais Twilio
3. [ ] Adicionar credenciais Google Cloud
4. [ ] Executar `npm run prisma:migrate`
5. [ ] Testar endpoints com Postman
6. [ ] Implementar Prisma nos controllers
7. [ ] Criar telas adicionais no frontend

---

## 🆘 Problemas Comuns

**Erro de conexão ao banco**
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres

# Verificar DATABASE_URL no .env
DATABASE_URL=postgresql://user:password@localhost:5432/app_valet
```

**Erro CORS**
```bash
# Adicionar frontend URL em .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,https://seu-dominio.com
```

**Token expirado**
```bash
# Usar refresh endpoint
POST /api/auth/refresh
```

---

## 📞 Suporte

- Consulte [docs/SETUP.md](docs/SETUP.md) para instalação
- Consulte [docs/API.md](docs/API.md) para endpoints
- Consulte [docs/FLUXOS.md](docs/FLUXOS.md) para diagramas

---

**Desenvolvido com ❤️ para gerenciamento de valets**

Last Updated: 20/01/2026
