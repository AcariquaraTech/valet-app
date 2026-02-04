# 🎯 Alterações Necessárias - Painel Admin para Gerenciar Valets

## Situação Atual

Com a implementação de **multi-tenant**, agora o sistema suporta múltiplos valets (clientes) com isolamento total de dados. 

A mudança mais importante é que **Access Keys agora precisam estar vinculadas a um Cliente (Valet)**.

---

## 📊 Alterações no Banco de Dados

### Tabela `access_keys`

Agora é **obrigatório** preencher:

```sql
ALTER TABLE access_keys 
  ADD COLUMN clientId TEXT NOT NULL;
```

**Campo novo/modificado:**
- ✅ `clientId` (UUID) - ID do Client (Valet) que vai usar essa chave

**Dados preenchidos automaticamente:**
- `clientName` - Nome do cliente (cópia de clients.name)
- `companyName` - Razão social (cópia de clients.companyName)
- `clientEmail` - Email (cópia de clients.email)
- `clientPhone` - Telefone (cópia de clients.phone)

---

## 🔧 O Que Precisa Ser Alterado no Painel Admin

### 1. **Tela de Criar Access Key**

**Antes (sem multi-tenant):**
```
┌─────────────────────────────────────┐
│ Gerar Nova Access Key               │
├─────────────────────────────────────┤
│ Nome do Cliente: [_____________]     │
│ Email: [_____________________]       │
│ Telefone: [________________]         │
│ Data de Expiração: [__________]      │
├─────────────────────────────────────┤
│  [Gerar]                             │
└─────────────────────────────────────┘
```

**Depois (com multi-tenant):**
```
┌─────────────────────────────────────┐
│ Gerar Nova Access Key               │
├─────────────────────────────────────┤
│ Selecionar Valet: [v Valet Demo]    │ ← NOVO
│   └─ Valet Demo (abc-123)            │ ← Dropdown
│   └─ Valet B (xyz-456)               │
│   └─ Valet C (def-789)               │
│                                      │
│ Email: [_____________________]       │ ← Opcional (se diferente do valet)
│ Telefone: [________________]         │ ← Opcional
│ Data de Expiração: [__________]      │
├─────────────────────────────────────┤
│  [Gerar]                             │
└─────────────────────────────────────┘
```

**Lógica:**
- Quando selecionar um Valet, auto-preenche name, email, phone, companyName
- Permite editar se necessário
- Gera Access Key vinculada ao Valet selecionado

### 2. **Tela de Gerenciar Clientes/Valets**

**Nova tela necessária** (se não existir):

```
┌────────────────────────────────────────┐
│ Gerenciar Valets                       │
├────────────────────────────────────────┤
│ [+ Novo Valet]                         │
│                                        │
│ Valet Demo (admin@valet-demo.com.br)   │
│ └─ Chaves: 1 | Usuários: 1             │ ← Links
│ └─ [Editar] [Excluir] [Ver Chaves]     │
│                                        │
│ Valet B (contact@valet-b.com.br)       │
│ └─ Chaves: 0 | Usuários: 0             │
│ └─ [Editar] [Excluir] [Ver Chaves]     │
├────────────────────────────────────────┤
│ Total: 2 valets | 1 chave ativa        │
└────────────────────────────────────────┘
```

### 3. **Formulário para Criar Novo Valet**

```
┌────────────────────────────────────────┐
│ Novo Valet                             │
├────────────────────────────────────────┤
│ Nome: [_____________________]           │
│ Razão Social: [______________]          │
│ Email: [__________________]             │
│ Telefone: [_______________]             │
│ CNPJ: [____________________]            │
│ Endereço: [________________]            │
│ Cidade: [_____] Estado: [__] CEP: [__] │
├────────────────────────────────────────┤
│  [Criar Valet]                         │
└────────────────────────────────────────┘
```

---

## 🔌 Mudanças na API

### Gerar Access Key (POST /api/access-keys/generate)

**Antes:**
```json
{
  "clientName": "João Silva",
  "clientEmail": "joao@email.com",
  "clientPhone": "11999999999",
  "expiresAt": "2026-02-03T23:59:59Z"
}
```

**Depois:**
```json
{
  "clientId": "8fdcf470-737a-4961-ac53-a4b7ab52a1ad",  // ← NOVO (obrigatório)
  "clientName": "João Silva",  // ← Opcional (auto-preenchido)
  "clientEmail": "joao@email.com",  // ← Opcional
  "clientPhone": "11999999999",  // ← Opcional
  "expiresAt": "2026-02-03T23:59:59Z"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "key-123",
    "code": "VALET-P3FZW41T76XW2OV",
    "clientId": "8fdcf470-737a-4961-ac53-a4b7ab52a1ad",
    "clientName": "Valet Demo",
    "status": "active",
    "expiresAt": "2026-02-03T23:59:59Z"
  }
}
```

### Criar Client/Valet (POST /api/clients - NOVO)

**Request:**
```json
{
  "name": "Estacionamento Central",
  "email": "admin@estacionamento.com.br",
  "phone": "1133333333",
  "companyName": "Central Park Estacionamento Ltda",
  "address": "Rua Principal, 500",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "document": "12345678000190"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "client-456",
    "name": "Estacionamento Central",
    "email": "admin@estacionamento.com.br"
  }
}
```

---

## 📋 Checklist de Implementação

### Para o Painel Web Dev:

- [ ] Tela de Gerenciar Valets (CRUD)
- [ ] Criar novo Valet (formulário)
- [ ] Editar Valet
- [ ] Deletar Valet (cascata: remove Access Keys e dados)
- [ ] Ver detalhes do Valet
- [ ] Modificar formulário de gerar Access Key:
  - [ ] Adicionar dropdown de Valets
  - [ ] Auto-preencher dados do valet
  - [ ] Tornar clientId obrigatório
- [ ] Dashboard com estatísticas:
  - [ ] Total de valets
  - [ ] Total de Access Keys
  - [ ] Chaves expiradas/ativas
  - [ ] Usuários por valet

### Para o App Mobile:

✅ Já está feito:
- [x] Login com Access Key vinculada a Valet
- [x] Token JWT com valetClientId
- [x] Filtros automáticos por valet
- [x] Relatórios isolados por valet
- [x] Exibir ID do veículo e cliente

---

## 🚀 Exemplo de Fluxo Completo

### 1. Dev cria novo Valet
```
Admin Web → Gerenciar Valets → + Novo Valet
Preenche: Nome, Email, Telefone, CNPJ, Endereço
Clica: [Criar Valet]
Sistema cria: Client record com ID único
```

### 2. Dev gera Access Key para o Valet
```
Admin Web → Gerar Access Key
Seleciona: "Estacionamento Central" (dropdown)
Auto-preenche: Name, Email, Phone, Company
Preenche: Data de Expiração
Clica: [Gerar]
Sistema cria: Access Key com clientId vinculado
Exibe: VALET-XXXXXXXXXXXXXXXX
```

### 3. Cliente Valet usa no App
```
App → Login
Insere: username, password, access_key_code
Clica: [Entrar]
Backend:
  - Valida Access Key
  - Extrai clientId da Access Key
  - Gera JWT com valetClientId
  - Retorna token
App:
  - Armazena token
  - Todas requisições filtram por valetClientId
  - Valet vê APENAS seus dados
```

---

## 💡 Diagramas de Relacionamento

### Antes (Sem Isolamento):
```
App Login
  ↓
Access Key (sem valet)
  ↓
JWT Token
  ↓
SELECT * FROM vehicles (TODOS!)
```

### Depois (Com Isolamento):
```
App Login
  ↓
Access Key → Client (Valet)
  ↓
JWT Token {valetClientId: "xyz"}
  ↓
SELECT * FROM vehicles WHERE valetClientId = "xyz"
```

---

## ⚠️ Considerações Importantes

1. **Migração de Dados Existentes**:
   - Se você tiver Access Keys antigas, precisa:
     1. Criar um Client para cada grupo de Access Keys
     2. Atualizar clientId em cada Access Key
     ```sql
     UPDATE access_keys 
     SET clientId = 'client-id-here' 
     WHERE code LIKE 'VALET-%'
     ```

2. **Deletar Valet**:
   - Se deletar um Client, todos seus dados são deletados (CASCADE)
   - Implementar soft-delete se precisar manter histórico

3. **Transferência entre Valets**:
   - Atualmente não é possível mover um veículo de um valet para outro
   - Pode ser uma feature futura se necessário

4. **Suporte Multi-Idioma**:
   - Labels do painel precisam ser traduzidos se necessário

---

**Status**: 📋 Implementação em andamento
**Prioridade**: 🔴 Alta (bloqueante para múltiplos clientes)
**Data**: 2026-02-03
