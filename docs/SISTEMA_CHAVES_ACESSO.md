# 🔐 Sistema de Controle de Acesso (Licenças)

## 📋 Visão Geral

O sistema de chaves de acesso permite você (desenvolvedor) controlar quem pode usar o app, protegendo contra pirataria e garantindo que apenas clientes com mensalidade ativa tenham acesso.

---

## 🎯 Como Funciona

### 1️⃣ **Você gera uma chave de acesso** (Como Admin)
```
Cliente João paga mensalidade de fevereiro
↓
Você gera chave: VALET-ABC123XYZ com validade até 28/02/2026
↓
Você compartilha a chave com o cliente (WhatsApp, Email, SMS)
```

### 2️⃣ **Cliente instala e usa a chave** (First Launch)
```
Cliente abre o app pela primeira vez
↓
App mostra tela: "Insira a chave de acesso"
↓
Cliente digita a chave recebida: VALET-ABC123XYZ
↓
App valida com backend
↓
Se válida → App funciona normalmente
Se inválida/expirada → Acesso negado
```

### 3️⃣ **App valida periodicamente** (Background)
```
A cada 7 dias (ou ao abrir o app):
↓
App valida a chave com o backend
↓
Se expirou/foi revogada → Bloqueia o app
Se continua válida → Segue usando normalmente
```

### 4️⃣ **Você revoga o acesso** (Controle Total)
```
Cliente não pagou mensalidade
↓
Você revoga a chave no admin
↓
Na próxima validação → App bloqueia com mensagem
↓
Cliente vê: "Acesso revogado. Entre em contato com o administrador"
```

---

## 🚀 Como Usar

### **ADMIN - Gerar Chave de Acesso**

#### **Via Postman/API:**
```bash
POST http://seu-backend:3000/api/access-keys/generate

Body (JSON):
{
  "clientName": "João Silva",
  "clientEmail": "joao@email.com",
  "clientPhone": "11999999999",
  "expiresAt": "2026-02-28T23:59:59Z"
}

Response:
{
  "success": true,
  "message": "Chave de acesso gerada com sucesso",
  "data": {
    "id": "uuid-aqui",
    "code": "VALET-ABC123XYZ",
    "clientName": "João Silva",
    "status": "active",
    "expiresAt": "2026-02-28T23:59:59Z",
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

**Copie a chave `VALET-ABC123XYZ` e compartilhe com o cliente!**

---

### **ADMIN - Listar Todas as Chaves**

```bash
GET http://seu-backend:3000/api/access-keys

Headers:
- Authorization: Bearer <seu-token-admin>

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid-1",
      "code": "VALET-ABC123XYZ",
      "clientName": "João Silva",
      "status": "active",
      "expiresAt": "2026-02-28T23:59:59Z",
      "lastValidatedAt": "2026-02-01T10:30:00Z"
    },
    {
      "id": "uuid-2",
      "code": "VALET-DEF456UVW",
      "clientName": "Maria Santos",
      "status": "active",
      "expiresAt": "2026-02-28T23:59:59Z",
      "lastValidatedAt": "2026-01-31T15:00:00Z"
    }
  ]
}
```

---

### **ADMIN - Revogar Acesso (Bloquear Cliente)**

```bash
PUT http://seu-backend:3000/api/access-keys/{id}/revoke

Body:
{
  "reason": "Mensalidade não paga"
}

Response:
{
  "success": true,
  "message": "Chave revogada com sucesso",
  "data": {
    "id": "uuid-1",
    "code": "VALET-ABC123XYZ",
    "status": "revoked",
    "revokedAt": "2026-02-01T10:35:00Z",
    "revokedReason": "Mensalidade não paga"
  }
}
```

---

### **ADMIN - Renovar Chave (Estender Validade)**

```bash
PUT http://seu-backend:3000/api/access-keys/{id}/renew

Body:
{
  "expiresAt": "2026-03-28T23:59:59Z"
}

Response:
{
  "success": true,
  "message": "Chave renovada com sucesso",
  "data": {
    "id": "uuid-1",
    "code": "VALET-ABC123XYZ",
    "expiresAt": "2026-03-28T23:59:59Z",
    "status": "active"
  }
}
```

---

### **ADMIN - Ver Logs de Validação**

```bash
GET http://seu-backend:3000/api/access-keys/{id}/logs

Response:
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "log-1",
      "status": "valid",
      "deviceId": "SM-G950F",
      "appVersion": "1.0.0",
      "osVersion": "13",
      "createdAt": "2026-02-01T10:30:00Z"
    },
    {
      "id": "log-2",
      "status": "valid",
      "deviceId": "SM-G950F",
      "appVersion": "1.0.0",
      "osVersion": "13",
      "createdAt": "2026-01-31T15:00:00Z"
    }
  ]
}
```

---

### **CLIENT - Inserir Chave no App**

1. Cliente abre o app pela **primeira vez**
2. Vê a tela: **"🔑 Ative sua Licença"**
3. Campo de entrada: **"Chave de Acesso"**
4. Insere: **VALET-ABC123XYZ**
5. Clica: **"Validar Chave"**
6. Se válida: **Acesso liberado** ✅
7. Se inválida: **Mostra erro** ❌

---

## 📊 Fluxo Completo (Visualmente)

```
┌─────────────────────────────────────────────────────────────┐
│ PASSO 1: Você cria chave no backend (Admin)                 │
│ POST /api/access-keys/generate                              │
│ → Gera: VALET-ABC123XYZ (validade: 28/02/2026)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PASSO 2: Cliente recebe a chave                             │
│ Você compartilha: "Sua chave é: VALET-ABC123XYZ"           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PASSO 3: Cliente abre o app                                 │
│ Tela de Access Key → Digita a chave                         │
│ POST /api/access-keys/validate                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
         ✅ VÁLIDA              ❌ INVÁLIDA
    ┌──────────────────┐    ┌──────────────────────┐
    │ Armazena chave   │    │ Mostra erro:         │
    │ Acesso liberado  │    │ "Chave inválida"     │
    │ App funciona     │    │ Tenta novamente      │
    └────────┬─────────┘    └──────────────────────┘
             │
             ↓
    ┌─────────────────────────────────┐
    │ A CADA 7 DIAS (background):     │
    │ Revalida a chave no backend     │
    │ Se expirou/revogou → Bloqueia   │
    └─────────────────────────────────┘
```

---

## 🔧 Configuração Backend

### **Adicionar ao `app.js` (se não estiver)**

```javascript
import accessKeyRoutes from './src/routes/accessKeyRoutes.js';

// ... outras rotas

app.use('/api/access-keys', accessKeyRoutes);
```

### **Criar Migração do Banco**

```bash
cd backend
npx prisma migrate dev --name add_access_keys
```

Isso vai criar as tabelas:
- `access_keys` - Armazena as chaves e validades
- `access_validation_logs` - Log de tentativas de validação

---

## 💡 Dicas Importantes

### **1. Formato da Chave**
- Sempre gera automático: `VALET-` + 15 caracteres aleatórios
- Exemplo: `VALET-K9M2N5P7Q3R8S1T4`

### **2. Validade**
- Defina a data como o último dia do mês da mensalidade
- Exemplo: Fevereiro 2026 → `2026-02-28T23:59:59Z`

### **3. Device ID**
- O app rastreia qual device está usando a chave
- Impede compartilhamento entre múltiplos devices (opcional)
- Pode ser o mesmo device se reinstalar o app

### **4. Logs de Validação**
- Você pode ver quando cada cliente usou o app
- Útil para detectar uso fora do horário
- Use: `GET /api/access-keys/{id}/logs`

### **5. Revogação Imediata**
- Ao revogar uma chave, o app bloqueia na próxima sincronização
- Sincroniza a cada 7 dias OU ao abrir o app
- Para bloquear instantaneamente: Diga ao cliente para fechar e reabrir o app

---

## ⚠️ Segurança

### **O que está protegido:**
✅ Apenas quem tem a chave usa o app  
✅ Você pode revogar acesso a qualquer momento  
✅ Validade controlada por você  
✅ Logs rastreiam cada tentativa de acesso  
✅ Device ID evita compartilhamento em massa  

### **O que NÃO está protegido:**
⚠️ Se cliente compartilhar a chave com alguém, o app funcionará  
⚠️ A chave é salva localmente (não é segredíssimo)  

**Melhor prática:** Combine com um sistema de login único por cliente

---

## 🎓 Exemplos de Uso

### **Cenário 1: Novo Cliente**
1. Cliente paga R$ 500 de mensalidade
2. Você gera chave: `VALET-XYZ789...`
3. Você manda SMS/WhatsApp: "Sua chave: VALET-XYZ789..."
4. Cliente instala app e insere a chave
5. App desbloqueado por 30 dias

### **Cenário 2: Cliente Não Paga**
1. Vencimento da mensalidade = 28/02
2. 01/03 cliente tenta usar = Chave expirada
3. Você pode revogar manualmente
4. Cliente vê: "Acesso expirado. Renove sua mensalidade"

### **Cenário 3: Reinstalação do App**
1. Cliente desinstala e reinstala o app
2. App pede a chave novamente
3. Cliente insere a mesma chave
4. App valida e funciona normalmente

### **Cenário 4: Múltiplos Dispositivos**
1. Cliente tem 2 devices (celular + tablet)
2. Opção A: Use mesma chave em ambos
3. Opção B: Gere chaves separadas para cada device

---

## 🛠️ Troubleshooting

**P: A chave não valida?**  
R: Verifique se o backend está rodando e a chave foi criada corretamente.

**P: Cliente quer usar em múltiplos devices?**  
R: Gere chaves separadas para cada device ou permita reutilização da mesma.

**P: Como forçar validação imediata?**  
R: Cliente fecha o app e abre novamente (validação ao iniciar).

**P: Posso mudar a data de expiração?**  
R: Sim, use o endpoint `/renew` para estender a data.

---

## 📞 Próximos Passos

1. ✅ **Execute a migração do banco:** `npx prisma migrate dev`
2. ✅ **Teste a API com Postman**
3. ✅ **Gere uma chave de teste**
4. ✅ **Instale o APK no device**
5. ✅ **Insira a chave de teste no app**
6. ✅ **Verifique se app desbloqueou**

Sucesso! 🎉
