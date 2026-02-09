# 🔐 Sistema de Autenticação Multi-Cliente

## O que foi implementado

O **client-admin** agora usa o **mesmo sistema de autenticação por chave de acesso** que o aplicativo mobile, garantindo isolamento de dados entre diferentes clientes de estacionamento.

---

## 🎯 Como Funciona

### 1. **Login com Chave de Acesso**

Agora o login requer **3 campos**:
1. **Código da Chave de Acesso** (ex: `VALET-P3FZW41T76XW2OV`)
2. **Usuário** (nickname)
3. **Senha**

### 2. **Fluxo de Autenticação**

```
┌─────────────────────────────────────────────┐
│  Cliente acessa portal web                   │
│  Insere: Chave + Usuário + Senha            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Backend valida:                             │
│  ✓ Chave de acesso existe?                  │
│  ✓ Chave está ativa?                        │
│  ✓ Usuário existe?                          │
│  ✓ Senha está correta?                      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Backend retorna:                            │
│  • Token JWT (contém valetClientId)         │
│  • Dados do usuário                         │
│  • Dados da chave de acesso (AccessKey)     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Frontend armazena:                          │
│  • authToken (localStorage)                 │
│  • user (localStorage)                      │
│  • accessKey (localStorage) ← NOVO!         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Portal mostra:                              │
│  📊 Nome da Empresa                         │
│  👤 Nome do Cliente                         │
│  🟢 Status (Ativo/Inativo)                  │
└─────────────────────────────────────────────┘
```

### 3. **Isolamento de Dados**

Cada requisição para a API inclui o **token JWT** que contém:
```javascript
{
  id: 123,              // ID do usuário
  nickname: 'admin',    // Nome de usuário
  role: 'admin',        // Papel (admin, operator)
  valetClientId: 1      // ← ID do cliente (isolamento)
}
```

O backend **filtra todos os dados** usando `valetClientId`:
- ✅ Relatórios mostram apenas veículos daquele cliente
- ✅ Entradas/saídas filtradas por cliente
- ✅ Dados completamente isolados entre clientes

---

## 📊 Informações Mostradas no Portal

### Header do Portal
```
📊 Estacionamento Park & Go
Cliente: João Silva | 🟢 Ativo
```

Exibe:
- **Nome da Empresa** (companyName) ou **Nome do Cliente** (clientName)
- **Status da Chave** (🟢 Ativo ou 🔴 Inativo)
- **Cliente atual** (quem está acessando)

---

## 🔒 Segurança

### O que está protegido

1. **Multi-Tenancy Completo**
   - Cada cliente vê apenas seus próprios dados
   - Impossível acessar dados de outro cliente
   - Filtro automático em todas as queries

2. **Validação em Camadas**
   ```
   Frontend → API → JWT Token → valetClientId → Database Filter
   ```

3. **Chave de Acesso Obrigatória**
   - Não é possível fazer login sem chave válida
   - Chaves inativas são rejeitadas
   - Chaves expiradas não funcionam

---

## 🆚 Comparação: Antes vs Depois

### ❌ Antes
```javascript
// Login simples
POST /api/auth/login
{
  "nickname": "admin",
  "password": "senha123"
}

// ⚠️ PROBLEMA: Qualquer usuário via dados de TODOS os clientes
```

### ✅ Agora
```javascript
// Login com isolamento
POST /api/auth/login
{
  "accessKeyCode": "VALET-P3FZW41T76XW2OV",  // ← NOVO!
  "nickname": "admin",
  "password": "senha123"
}

// ✅ SEGURO: Usuário vê apenas dados do seu cliente
```

---

## 🔑 Exemplo Prático

### Cliente A (Estacionamento Park & Go)
- **Chave**: `VALET-ABC123XYZ456`
- **valetClientId**: `1`
- **Vê apenas**: Veículos do Park & Go

### Cliente B (Estacionamento Center Plus)
- **Chave**: `VALET-DEF789UVW012`
- **valetClientId**: `2`
- **Vê apenas**: Veículos do Center Plus

**Resultado**: Dados completamente isolados! ✅

---

## 📱 Compatibilidade com App Mobile

O portal web agora funciona **exatamente igual** ao app mobile:

| Funcionalidade | App Mobile | Portal Web |
|----------------|------------|------------|
| Login com chave | ✅ | ✅ |
| Isolamento por cliente | ✅ | ✅ |
| JWT com valetClientId | ✅ | ✅ |
| Filtro automático de dados | ✅ | ✅ |
| Validação de chave ativa | ✅ | ✅ |

---

## 🎨 Interface do Login

### Campos do Formulário

```
┌──────────────────────────────────────────┐
│  🔐 Portal do Cliente                     │
│  Acesse seu estacionamento               │
├──────────────────────────────────────────┤
│                                          │
│  Código da Chave de Acesso              │
│  [VALET-XXXXXXXXXXXX              ]     │
│  Use a mesma chave que você usa no app  │
│                                          │
│  Usuário                                 │
│  [Digite seu usuário              ]     │
│                                          │
│  Senha                                   │
│  [••••••••••••••••              ]       │
│                                          │
│  [        ENTRAR        ]               │
└──────────────────────────────────────────┘
```

### Header Após Login

```
┌──────────────────────────────────────────────────────┐
│  📊 Estacionamento Park & Go                         │
│  Cliente: João Silva | 🟢 Ativo      [Sair]        │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Dados Armazenados

### localStorage
```javascript
{
  // Token JWT
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  
  // Dados do usuário
  "user": {
    "id": 1,
    "name": "Admin User",
    "nickname": "admin",
    "role": "admin",
    "valetClientId": 1
  },
  
  // Dados da chave de acesso (NOVO!)
  "accessKey": {
    "id": 1,
    "code": "VALET-P3FZW41T76XW2OV",
    "clientId": 1,
    "clientName": "João Silva",
    "companyName": "Estacionamento Park & Go",
    "status": "active",
    "expiresAt": "2027-01-01T00:00:00Z"
  }
}
```

---

## ✅ Benefícios

1. **Segurança Total**
   - Dados isolados por cliente
   - Impossível acessar dados de outros

2. **Consistência**
   - Mesmo comportamento do app mobile
   - Mesma chave de acesso em ambos

3. **Rastreabilidade**
   - Sabe-se exatamente qual cliente está acessando
   - Logs e auditoria por cliente

4. **Escalabilidade**
   - Suporta múltiplos clientes
   - Cada um com acesso isolado

---

## 🚀 Próximos Passos

1. **Teste o Login**
   - Use a chave de acesso que você já tem
   - Mesmo usuário e senha do app

2. **Verifique o Isolamento**
   - Dados mostrados são apenas do seu cliente
   - Outros clientes não aparecem

3. **Deploy no Railway**
   - Railway vai detectar as mudanças
   - Fazer redeploy automaticamente

---

## 📞 Suporte

Se tiver problemas:
- ✅ Verifique se a chave está ativa
- ✅ Confirme usuário e senha corretos
- ✅ Verifique se a chave não expirou
- ✅ Limpe cache do navegador (Ctrl+Shift+Delete)

---

**Sistema Multi-Cliente implementado com sucesso! 🎉**
