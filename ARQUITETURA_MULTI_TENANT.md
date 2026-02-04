# 🏗️ Arquitetura Multi-Tenant - Isolamento de Dados por Valet

## 📋 Resumo das Mudanças

Implementado sistema **multi-tenant** para garantir isolamento completo de dados entre diferentes valets (clientes). Cada valet só consegue ver os dados que pertencem a ele.

---

## 🔐 Como Funciona o Isolamento

### 1. **Banco de Dados Único com Isolamento por `valetClientId`**

#### Schema Prisma Atualizado:
- Adicionado campo `valetClientId` em:
  - `Vehicle`: Identifica qual valet é dono do veículo
  - `VehicleEntry`: Identifica qual valet registrou a entrada/saída
  
- Adicionado campo `vehicleNumber` em `Vehicle`:
  - Número sequencial (opcional) para identificar veículos no movimento do pátio
  
- Relacionamento com `Client` para garantir isolamento:
  ```prisma
  model Vehicle {
    valetClientId String
    valetClient Client @relation("ValetVehicles", ...)
  }
  
  model VehicleEntry {
    valetClientId String
    valetClient Client @relation("ValetEntries", ...)
  }
  ```

### 2. **Autenticação com JWT Contém `valetClientId`**

**Login Flow:**
```
Usuário faz login com access key
    ↓
AccessKey associada a um Client (valet)
    ↓
JWT Token incluído valetClientId
    ↓
Token armazenado no app mobile
    ↓
Todas requisições incluem valetClientId
```

**Token JWT Exemplo:**
```json
{
  "id": "user-123",
  "nickname": "admin_valet_a",
  "role": "admin",
  "valetClientId": "client-abc-123",
  "iat": 1707003000,
  "exp": 1707089400
}
```

### 3. **Filtros Automáticos em Todas as Queries**

Todas as rotas foram atualizadas para filtrar por `valetClientId`:

#### Vehicle Controller:
```javascript
// registerEntry
const valetClientId = req.user.valetClientId;

const vehicle = await prisma.vehicle.findFirst({
  where: { 
    plate,
    valetClientId, // ← ISOLAMENTO
  }
});

const entry = await prisma.vehicleEntry.create({
  data: {
    vehicleId: vehicle.id,
    valetClientId, // ← ISOLAMENTO
  }
});
```

#### Report Routes:
```javascript
// daily-movement
const valetClientId = req.user.valetClientId;

const entries = await prisma.vehicleEntry.count({
  where: {
    entryTime: { gte: start, lte: end },
    valetClientId, // ← ISOLAMENTO
  }
});

// Peak hours (SQL raw)
prisma.$queryRaw`
  SELECT strftime('%Y-%m-%d', entryTime) as day, COUNT(*) as entries
  FROM vehicle_entries
  WHERE entryTime BETWEEN ${rangeStart} AND ${rangeEnd}
  AND valetClientId = ${valetClientId} -- ← ISOLAMENTO
  GROUP BY day
`
```

#### User Routes:
```javascript
// my-team
const valetClientId = req.user.valetClientId;

const accessKeys = await prisma.accessKey.findMany({
  where: {
    clientId: valetClientId, // ← ISOLAMENTO
  }
});
```

---

## 🛡️ Garantias de Segurança

### ✅ O que está protegido:

1. **Veículos**: Valet A não consegue ver veículos de Valet B
2. **Entradas/Saídas**: Apenas movimentos do próprio valet aparecem
3. **Relatórios**: Dados agregados apenas do próprio valet
4. **Usuários**: Cada valet só vê sua equipe
5. **Access Keys**: Apenas chaves do próprio valet

### ✅ Validações Implementadas:

- Middleware verifica se `valetClientId` está presente no token
- Cada query adiciona filtro `WHERE valetClientId = ${req.user.valetClientId}`
- Se usuário não tem `valetClientId`, retorna erro 403 Forbidden

---

## 📱 Mudanças no Frontend

### ReportsScreen.js - Movimento do Dia

Agora exibe:
- **#ID do Veículo**: `vehicle_number`
- **Placa**: Identificação única
- **Cliente**: Nome do dono do veículo
- **Entrada**: Horário de entrada
- **Saída**: Horário de saída (se saiu)
- **Duração**: Tempo estacionado em minutos

**Exemplo de Lista:**
```
#001  |  ABC-1234  |  João Silva
      Entrada: 14:30:00
      Saída: 16:15:00
      30min

#002  |  XYZ-5678  |  Maria Santos
      Entrada: 15:00:00
      (ainda estacionado)
```

---

## 🔄 Fluxo Completo de Segurança

```
1. REGISTRO/LOGIN
   └─ Usuário faz login com nickname + password + access_key_code
      ↓
   └─ Backend busca AccessKey (vinculada a um Client/Valet)
      ↓
   └─ JWT Token gerado com valetClientId incluído
      ↓
   └─ App armazena token em AsyncStorage

2. REQUISIÇÃO (ex: Registrar Entrada)
   └─ App envia: Bearer {token}
      ↓
   └─ Middleware authenticateToken() verifica JWT
      ↓
   └─ req.user.valetClientId extraído do token
      ↓
   └─ Controller valida se valetClientId existe
      ↓
   └─ Query criada com: WHERE valetClientId = req.user.valetClientId
      ↓
   └─ Resposta retorna apenas dados do valet

3. SEGURANÇA
   └─ Se usuário tenta manipular token para outro valetClientId:
      └─ Assinatura inválida → Token rejeitado
   └─ Se usuário tenta acessar dados de outro valet via URL:
      └─ Query WHERE valetClientId não encontra resultado → 404
```

---

## 📊 Estrutura do Banco de Dados

```sql
-- CLIENTS (Valets)
┌─────────────────────┐
│ Client              │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email               │
│ phone               │
│ companyName         │
│ ...                 │
└─────────────────────┘

-- VEHICLES (Veículos de cada valet)
┌──────────────────────┐
│ Vehicle              │
├──────────────────────┤
│ id (PK)              │
│ vehicleNumber        │ ← Novo (ID visual)
│ plate (UNIQUE)       │
│ valetClientId (FK)   │ ← ISOLAMENTO
│ clientId (FK)        │ (dono do carro)
│ clientName           │
│ ...                  │
└──────────────────────┘

-- ENTRIES/EXITS (Movimento de cada valet)
┌──────────────────────┐
│ VehicleEntry         │
├──────────────────────┤
│ id (PK)              │
│ vehicleId (FK)       │
│ valetClientId (FK)   │ ← ISOLAMENTO
│ entryTime            │
│ exitTime             │
│ operatorId           │
│ ...                  │
└──────────────────────┘

-- ACCESS KEYS (Licenças vinculadas ao valet)
┌──────────────────────┐
│ AccessKey            │
├──────────────────────┤
│ id (PK)              │
│ code (UNIQUE)        │
│ clientId (FK)        │ ← Vínculo ao Valet
│ clientName           │
│ status               │
│ expiresAt            │
│ users (N:M)          │
└──────────────────────┘
```

---

## 🚀 Próximos Passos (Recomendado)

1. **Backup Automático**
   - Implementar script que copia `dev.db` para nuvem diariamente
   - Proteger contra perda de dados

2. **Migração para PostgreSQL** (Produção)
   - SQLite é excelente para desenvolvimento
   - Para múltiplos clientes, usar PostgreSQL
   - Suporta mais conexões e é mais escalável

3. **Auditoria de Dados**
   - Adicionar tabela `SystemLog` para registrar todas ações
   - Quem entrou? Quando? Que dados acessou?

4. **Painel Web para Owner**
   - Dashboard para ver todos os valets
   - Gerenciar licenças (access keys)
   - Estatísticas agregadas

---

## ✅ Checklist de Segurança

- [x] Banco de dados com isolamento por `valetClientId`
- [x] JWT token inclui `valetClientId`
- [x] Middleware valida presença de `valetClientId`
- [x] Todas queries filtram por `valetClientId`
- [x] Controllers retornam erro 403 se `valetClientId` não existe
- [x] Access Key vinculada a Client (valet)
- [x] Frontend exibe ID do veículo e cliente
- [x] Relatórios mostram apenas dados do valet logado
- [x] Usuários da equipe filtrados por valet

---

## 📝 Exemplos de Queries Seguras

### ✅ CORRETO - Com Isolamento:
```javascript
const entries = await prisma.vehicleEntry.findMany({
  where: {
    valetClientId: req.user.valetClientId // ← FILTRO OBRIGATÓRIO
  }
});
```

### ❌ ERRADO - Sem Isolamento:
```javascript
const entries = await prisma.vehicleEntry.findMany();
// ❌ Retorna dados de TODOS os valets!
```

---

## 🔍 Testing

Para testar se isolamento funciona:

1. **Criar dois clientes:**
   ```
   Valet A: email@valet-a.com.br
   Valet B: email@valet-b.com.br
   ```

2. **Criar access keys para cada um**

3. **Fazer login com Valet A** → Ver apenas dados de A

4. **Fazer login com Valet B** → Ver apenas dados de B

5. **Tentar manipular token JWT** → Falha na validação

---

**Implementado por:** Arquitetura Multi-Tenant
**Data:** 2026-02-03
**Status:** ✅ Ativo
