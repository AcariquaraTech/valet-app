# 🎯 APP VALET - DIAGRAMA DE FLUXO E ARQUITETURA

## 🚀 FLUXO DE USO

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   USUARIO FINAL                            │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ (1. Abra Expo Go)
┌─────────────────────────────────────────────────────────────┐
│                   DEVICE/EMULADOR                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              EXPO GO (App)                          │   │
│  │  • Conecta ao Metro Bundler                         │   │
│  │  • Recebe bundle React Native                       │   │
│  │  • Renderiza componentes                            │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                           │
│  ┌──────────────▼──────────────────────────────────────┐   │
│  │           APP VALET UI (React Native)              │   │
│  │                                                     │   │
│  │  Screen Home ───────┐                              │   │
│  │                     ├──► Botões                     │   │
│  │  Screen Login ──────┤    Navegação                 │   │
│  │                     ├──► Estilos                    │   │
│  │  Screen Vehicles ───┘    Toque                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                     │
      (2. Escaneie QR code via Metro)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  COMPUTADOR (Dev)                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           METRO BUNDLER (Frontend)                  │   │
│  │                                                     │   │
│  │  • Compila App.js                                  │   │
│  │  • Gera QR code                                    │   │
│  │  • Envia bundle ao device                          │   │
│  │  • Hot reload em tempo real                        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │         EXPRESS BACKEND (Node.js)                   │   │
│  │                                                     │   │
│  │  • Porta 3000                                      │   │
│  │  • CORS habilitado                                 │   │
│  │  • JWT auth                                        │   │
│  │  • Rate limiting                                   │   │
│  │  • 6 endpoints                                     │   │
│  │                                                     │   │
│  │  POST   /api/auth/login     ─┐                     │   │
│  │  GET    /api/vehicles         │                    │   │
│  │  POST   /api/vehicles         ├─► Lógica           │   │
│  │  POST   /api/vehicle-entries  │   Controllers      │   │
│  │  POST   /api/vehicle-entries  │                    │   │
│  │  GET    /api/health         ─┘                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │        PRISMA ORM (Database Client)                │   │
│  │                                                     │   │
│  │  • Conecta ao SQLite                               │   │
│  │  • Valida queries                                  │   │
│  │  • Migra schemas                                   │   │
│  │  • Seed data                                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                     │                                       │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │         SQLITE DATABASE (Local File)               │   │
│  │         prisma/dev.db                              │   │
│  │                                                     │   │
│  │  Tables:                                           │   │
│  │  ├─ Users         (admin@valet.com)                │   │
│  │  ├─ Vehicles      (ABC-1234, XYZ-9999)             │   │
│  │  ├─ VehicleEntry  (Entrada/saída)                 │   │
│  │  ├─ SmsNotif      (Notificações)                  │   │
│  │  ├─ OcrScan       (OCR data)                      │   │
│  │  └─ SystemLog     (Auditoria)                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 FLUXO DE DADOS

```
USUARIO INTERAGE COM TELA
          │
          ▼
USER PRESSIONA BOTÃO
          │
          ├─ Home: "Ir para Login"
          │    └─ setScreen('login')
          │         └─ Re-render tela Login
          │
          ├─ Home: "Ver Veículos"  
          │    └─ setScreen('vehicles')
          │         └─ Re-render tela Veículos
          │
          └─ Login/Vehicles: "Voltar"
               └─ setScreen('home')
                    └─ Re-render tela Home

ESTADO MUDA
          │
          ▼
COMPONENTE RE-RENDERIZA
          │
          ▼
USUARIO VÊ NOVO CONTEÚDO
```

---

## 🔐 FLUXO DE AUTENTICAÇÃO (Backend)

```
1. USUARIO FAZ LOGIN
   └─ POST /api/auth/login
      ├─ Email: admin@valet.com
      └─ Password: senha123
              │
              ▼
2. BACKEND VALIDA
   ├─ Encontra user no DB
   ├─ Compara password com bcrypt
   └─ Se OK, gera JWT token
              │
              ▼
3. RETORNA TOKEN
   ├─ Token válido por 7 dias
   ├─ Pode usar em requests
   └─ Headers: Authorization: Bearer {token}
              │
              ▼
4. CLIENTE USA TOKEN
   ├─ GET /api/vehicles + token
   ├─ Backend valida JWT
   ├─ Se válido, retorna dados
   └─ Se inválido, retorna 401
```

---

## 📱 RENDERIZAÇÃO NO DEVICE

```
METRO ENVIA BUNDLE
        │
        ▼
EXPO GO RECEBE
        │
        ▼
REACT NATIVE ENGINE INICIA
        │
        ├─ Cria Virtual DOM
        ├─ Mapeia para componentes nativos
        └─ Renderiza em tela
        │
        ▼
TELA APARECER NO DEVICE
        │
        ├─ View (ScrollView)
        │  ├─ View (screen container)
        │  │  ├─ Text (título)
        │  │  ├─ Text (subtitle)
        │  │  └─ TouchableOpacity (botões)
        │  │     └─ Text (label)
        │  │
        │  └─ Estilos aplicados
        │     ├─ Colors
        │     ├─ Padding
        │     ├─ BorderRadius
        │     └─ FontSize
        │
        ▼
USUARIO INTERAGE (toque)
```

---

## 🔄 CICLO DE DESENVOLVIMENTO

```
┌────────────────────────────────────────────────────┐
│                   DESENVOLVIMENTO                  │
└────────┬─────────────────────────────┬─────────────┘
         │                             │
         ▼                             ▼
    EDITAR App.js              EDITAR backend/src
         │                             │
         ▼                             ▼
    SALVAR                        SALVAR
         │                             │
         ▼                             ▼
    Metro detecta mudança      Backend auto-restart
         │                             │
         ▼                             ▼
    Recompila bundle           Endpoints atualizados
         │                             │
         ▼                             ▼
    Envia para device           Pronto para requests
         │                             │
         ▼                             ▼
    Expo Go hot-reloads        Testa com curl/Postman
         │                             │
         ▼                             ▼
    VÊ MUDANÇAS EM TEMPO REAL   VÊ NOVAS RESPOSTAS
```

---

## 🗂️ ESTRUTURA DE PASTAS

```
APP VALLET
│
├── backend/
│   ├── src/
│   │   ├── app.js ......................... Express setup
│   │   ├── controllers/
│   │   │   ├── authController.js ......... Login, auth
│   │   │   └── vehicleController.js ...... CRUD veículos
│   │   ├── routes/
│   │   │   ├── authRoutes.js ............ Auth endpoints
│   │   │   └── vehicleRoutes.js ......... Vehicle endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js ................. JWT verification
│   │   │   └── cors.js ................. CORS config
│   │   ├── utils/
│   │   │   └── helpers.js .............. Utility functions
│   │   └── lib/
│   │       └── prisma.js ............... ORM client
│   ├── prisma/
│   │   ├── schema.prisma ............... Database schema
│   │   └── dev.db ...................... SQLite file
│   ├── package.json ................... Dependencies
│   ├── .env ........................... Environment vars
│   └── test.js ........................ Seed script
│
└── frontend/
    ├── App.js ......................... Main component
    ├── index.js ....................... Entry point
    ├── metro.config.js ................ Metro bundler config
    ├── app.json ....................... Expo config
    ├── package.json ................... Dependencies
    ├── .env ........................... API URL
    ├── assets/
    │   ├── icon.png
    │   ├── splash.png
    │   └── adaptive-icon.png
    └── src/
        └── (Componentes futuros)
```

---

## 🔌 CONEXÕES

```
                    DEVICE
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    Expo Go    WiFi/USB    Network


METRO BUNDLER ◄──────► EXPO GO
  (Port 19000)      (Device)
       │
       ├─ App.js source
       ├─ React Native bundle
       └─ Live reload


EXPRESS API ◄──────► FRONTEND APP
(Port 3000)    (API Requests)
       │
       ├─ /api/auth/login
       ├─ /api/vehicles
       └─ /api/vehicle-entries


PRISMA ◄──────► SQLite
(ORM)        dev.db
       │
       ├─ User model
       ├─ Vehicle model
       └─ VehicleEntry model
```

---

## 🚀 SEQUÊNCIA DE INICIALIZAÇÃO

```
USUARIO LIGA COMPUTADOR
│
├─ Terminal 1: cd backend && node src/app.js
│  ├─ Express inicia
│  ├─ Prisma conecta ao banco
│  ├─ Admin user verificado
│  ├─ Server listening on :3000
│  └─ Ready for requests ✓
│
├─ Terminal 2: cd frontend && npm start
│  ├─ Metro Bundler inicia
│  ├─ App.js compilado
│  ├─ Bundle criado
│  ├─ QR code gerado
│  ├─ Waiting for connection...
│  └─ Ready ✓
│
└─ USUARIO: Abre Expo Go + escaneie QR
   ├─ Expo Go conecta ao Metro
   ├─ Recebe bundle
   ├─ React Native renderiza
   ├─ APP VALET aparece na tela
   └─ Ready for interaction ✓

TUDO FUNCIONANDO! 🎉
```

---

## 📈 CRESCIMENTO DA APLICAÇÃO

### Fase 1 (ATUAL): MVP Básico
```
✓ 3 telas simples
✓ Navegação por botões
✓ Dados hardcoded
✓ Backend com endpoints
✓ Banco de dados SQLite
✓ Autenticação JWT
```

### Fase 2: Integração API
```
+ Axios para HTTP requests
+ Chamadas de login reais
+ Fetch de dados do banco
+ Persistência de dados
+ Error handling
```

### Fase 3: UX Melhorada
```
+ React Navigation
+ Telas profissionais
+ Animações
+ Validações de form
+ Loading states
```

### Fase 4: Features Completas
```
+ SMS notifications
+ OCR scanning
+ Real-time updates
+ Analytics
+ Push notifications
```

---

## ✅ CHECKLIST TÉCNICO

```
FRONTEND
[✓] React Native compilando
[✓] Expo Metro rodando
[✓] App.js sem erros
[✓] 3 telas implementadas
[✓] Navegação funcionando
[✓] Estilos aplicados
[✓] QR code gerado
[✓] Pronto para Expo Go

BACKEND
[✓] Express rodando
[✓] Prisma conectado
[✓] SQLite funcional
[✓] Migrations aplicadas
[✓] Endpoints testados
[✓] JWT implementado
[✓] Admin user criado
[✓] CORS/Helmet ativo

BANCO
[✓] dev.db existe
[✓] Tabelas criadas
[✓] Índices criados
[✓] Seed data loaded
[✓] Queries rápidas
[✓] Sem erros de integrity

SEGURANÇA
[✓] Helmet.js
[✓] CORS configurado
[✓] Rate limiting
[✓] JWT com expiração
[✓] Bcrypt para senhas
[✓] .env para secrets
```

---

## 🎯 FLUXO DE BUG FIX

```
BUG ENCONTRADO
     │
     ▼
IDENTIFICAR ONDE
     │
     ├─ Frontend? (Tela branca, botão não funciona)
     ├─ Backend? (API retorna erro)
     └─ Banco? (Dados não salvam)
     │
     ▼
EXECUTAR LOCAL
     │
     ├─ npm start (frontend)
     ├─ node src/app.js (backend)
     └─ Abrir Expo Go
     │
     ▼
DEBUGAR COM LOGS
     │
     ├─ console.log() no código
     ├─ Ver terminal do Metro
     ├─ Ver terminal do backend
     └─ Usar React DevTools
     │
     ▼
IDENTIFICAR RAIZ
     │
     ├─ Verificar imports
     ├─ Verificar sintaxe
     ├─ Verificar lógica
     └─ Verificar dados
     │
     ▼
FAZER FIX
     │
     ├─ Editar arquivo
     ├─ Salvar
     ├─ Metro recompila (automático)
     └─ Expo Go hot-reloads
     │
     ▼
TESTAR NO DEVICE
     │
     ├─ Se OK: Pronto ✓
     └─ Se não: Repetir debug
```

---

**Diagrama Versão:** 1.0.0 ✅  
**Atualizado:** 2024  
**Desenvolvedor:** GitHub Copilot
