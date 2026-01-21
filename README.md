# APP Valet - Gerenciamento de Estacionamento

Sistema multiplataforma (iOS e Android) para gerenciamento de entrada e saída de veículos em valets, com autenticação por CNPJ/CPF, licenças e múltiplos tipos de usuários.

## 📋 Requisitos do Sistema

### Funcionalidades Principais
- ✅ Entrada e saída de veículos
- ✅ Vinculação de veículo a ID único
- ✅ SMS de notificação para clientes (entrada/saída)
- ✅ Cadastro opcional de contato do cliente
- ✅ Reconhecimento de placa via câmera (OCR)
- ✅ Login obrigatório
- ✅ Sistema de licenças por CNPJ/CPF
- ✅ Múltiplas chaves de acesso por CNPJ
- ✅ Dois tipos de usuários: Admin e Operador
- ✅ Dashboard com movimentos do dia (Admin)
- ✅ Relatórios de horário de pico (Admin)

### Tipos de Usuários

#### Admin
- Visualizar pátio
- Dar entrada/saída em veículos
- Visualizar movimento do dia
- Horários de pico
- Gerenciar operadores
- Relatórios

#### Operador
- Visualizar pátio
- Dar entrada/saída em veículos
- Sem acesso a relatórios

## 🏗️ Arquitetura

```
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── models/          # Modelos de banco de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middleware (autenticação, etc)
│   │   ├── services/        # Serviços (SMS, OCR, etc)
│   │   └── app.js           # Aplicação Express
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── screens/         # Telas do app
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── services/        # Serviços de API
│   │   ├── context/         # Context API para estado
│   │   ├── utils/           # Utilitários
│   │   └── App.js           # Componente principal
│   ├── app.json
│   └── package.json
│
└── docs/
    ├── DATABASE.md          # Schema do banco
    ├── API.md               # Documentação da API
    └── SETUP.md             # Guia de instalação
```

## 🔑 Modelo de Negócio

### Entidades Principais

1. **Empresa (CNPJ/CPF)**
   - Dados da empresa (CNPJ, razão social, contato)
   - Licenças ativas
   - Informações de pagamento

2. **Chave de Acesso**
   - Vinculada a uma empresa
   - Permite N logins
   - Status: ativa/inativa

3. **Usuário**
   - Login/Senha
   - Tipo: Admin ou Operador
   - Vinculado a uma chave de acesso
   - Vinculado a uma empresa

4. **Veículo**
   - Placa
   - Hora de entrada
   - Hora de saída
   - Status: estacionado/saído
   - Dados do cliente (opcional)

5. **Movimento do Dia**
   - Registro de entrada/saída
   - Horário
   - Usuário responsável
   - Dados do veículo

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT para autenticação
- Twilio para SMS
- Google Vision API para OCR

### Frontend
- React Native com Expo
- Redux ou Context API
- Axios para requisições HTTP
- React Navigation
- React Native Camera (para captura de placa)

## 📝 Próximos Passos

1. Configurar banco de dados PostgreSQL
2. Criar schema do banco de dados
3. Configurar projeto backend (Node.js)
4. Implementar autenticação JWT
5. Criar APIs REST
6. Configurar SMS com Twilio
7. Integrar OCR de placa
8. Criar projeto React Native
9. Implementar interfaces
10. Testes

## 📚 Documentação Detalhada

- [Database Schema](docs/DATABASE.md)
- [API Endpoints](docs/API.md)
- [Guia de Instalação](docs/SETUP.md)
