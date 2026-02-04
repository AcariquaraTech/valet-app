# 📱 Credenciais de Teste - APP Valet

## Login Credentials After Multi-Tenant Setup

Após a implementação de multi-tenant, o banco foi resetado com a migration. Use as credenciais abaixo para testar:

### ✅ Admin Account

| Campo | Valor |
|-------|-------|
| **Usuário** | `admin` |
| **Senha** | `admin` |
| **Access Key** | `VALET-P3FZW41T76XW2OV` |
| **Valet** | Valet Demo |
| **Email** | admin@valet-demo.com.br |

### 📱 Como Fazer Login no App:

1. Abra o APP Valet
2. Na tela de login, insira:
   - **Usuário**: `admin`
   - **Senha**: `admin`
   - **Access Key Code**: `VALET-P3FZW41T76XW2OV`
3. Clique em "Entrar"

### 🔄 Como Regenerar Credenciais

Se precisar gerar novas credenciais de teste:

```bash
cd backend
npm run seed
```

Isso criará novo Client, Usuário e Access Key, exibindo as credenciais no console.

### 🛠️ Para Criar Mais Valets

1. **Backend**: Criar endpoint admin para gerar novo Client + Access Key
2. **Admin Dashboard**: Interface para gerenciar clientes/valets (web)
3. **Cada Valet Precisa de**:
   - Cliente (Client) criado
   - Pelo menos uma Access Key
   - Usuário admin vinculado à chave

### 📋 Campos de um Client (Valet):

```
- name: Nome do estacionamento
- email: Email da empresa
- phone: Telefone de contato
- companyName: Razão social
- address: Endereço
- city: Cidade
- state: Estado (UF)
- zipCode: CEP
- document: CNPJ
```

---

**Status**: ✅ Multi-tenant ativo
**Data**: 2026-02-03
**Versão**: 2.0
