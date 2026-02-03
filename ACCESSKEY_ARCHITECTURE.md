# Arquitetura Multi-Tenancy com AccessKey

## 📋 Resumo das Mudanças

Implementação de uma arquitetura multi-tenant onde cada **AccessKey** representa um cliente único com seus dados de perfil (nome, empresa, email, telefone). O aplicativo agora herda essas informações da chave de acesso, em vez de permitir edição local.

## 🎯 Objetivo

- ✅ Cada cliente tem uma **chave de acesso particular**
- ✅ Dados do cliente vêm do **backend** (AccessKey) e são **read-only** no app
- ✅ **Impede inconsistências de dados**
- ✅ Estrutura pronta para **modelo SaaS multi-tenant**

## 🏗️ Arquitetura

### Backend

**Banco de Dados (Prisma Schema)**
```prisma
model AccessKey {
  id          String   @id @default(cuid())
  code        String   @unique
  clientName  String      // Nome do cliente
  companyName String?     // Nome da empresa  
  clientEmail String?     // Email do cliente
  clientPhone String?     // Telefone do cliente
  status      String      // "active" | "inactive"
  expiresAt   DateTime?   // Data de expiração
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Login Endpoint** (`POST /auth/login`)
```javascript
Response:
{
  success: true,
  data: {
    user: {
      id: "...",
      name: "...",
      nickname: "...",
      role: "admin" | "user"
    },
    token: "jwt_token...",
    accessKey: {
      id: "key_id",
      code: "KEY123",
      clientName: "Cliente X",
      companyName: "Empresa X LTDA",
      clientEmail: "cliente@email.com",
      clientPhone: "11999999999",
      status: "active",
      expiresAt: "2026-12-31"
    }
  }
}
```

### Frontend

**AuthContext.js** - Gerenciamento de Estado
```javascript
// Estado adicionado
const [accessKey, setAccessKey] = useState(null);

// Métodos atualizados:
1. bootstrapAsync()      // Restaura accessKey do AsyncStorage
2. login()               // Extrai e armazena accessKey da resposta
3. logout()              // Limpa accessKey
4. useAuth hook          // Expõe accessKey para components
```

**SettingsScreen.js** - Exibe Dados do Cliente
```javascript
// Dados exibidos (read-only):
- Nome do Cliente:  accessKey.clientName
- Empresa:          accessKey.companyName
- Email:            accessKey.clientEmail
- Telefone:         accessKey.clientPhone
- Status:           accessKey.status
- Apelido (User):   user.nickname
- Tipo:             user.role
```

**EditProfileScreen.js** → **ProfileScreen.js** - Apenas Visualização
```javascript
// Convertido de EditProfileScreen para ProfileScreen (read-only)
// Exibe:
1. 👤 Dados do Cliente (AccessKey)
   - Nome do Cliente
   - Empresa
   - Email
   - Telefone
   - Status (ativa/inativa)
   - Data de validade

2. 🔑 Conta de Acesso (User)
   - Apelido (Nickname)
   - Tipo de Usuário

3. 🔐 Chaves de Acesso Vinculadas
   - Lista de AccessKeys do usuário
```

## 🔄 Fluxo de Dados

```
Login Screen
   ↓
Login API (POST /auth/login)
   ↓
Response com { user, token, accessKey }
   ↓
AuthContext.login() extrai dados
   ↓
AsyncStorage.setItem('accessKey', JSON.stringify(accessKey))
   ↓
useAuth() expõe accessKey para components
   ↓
SettingsScreen / ProfileScreen exibem dados read-only
```

## 📁 Arquivos Modificados

### Backend
- ✅ `backend/prisma/schema.prisma` - Adicionado `companyName` à AccessKey
- ✅ `backend/prisma/migrations/20260203000242_add_company_name_to_access_key/` - Nova migration
- ✅ `backend/src/controllers/authController.js` - Login retorna accessKey

### Frontend
- ✅ `frontend/src/store/AuthContext.js` - Gerencia accessKey
- ✅ `frontend/src/screens/SettingsScreen.js` - Exibe dados de AccessKey
- ✅ `frontend/src/screens/EditProfileScreen.js` → Renomeado para ProfileScreen (read-only)

## 🧪 Como Testar

1. **Make login com credenciais corretas**
   ```
   Nickname: seu_usuario
   Senha: sua_senha
   Chave de Acesso: CHAVE123
   ```

2. **Verifique SettingsScreen → "👤 Seu Perfil"**
   - Deve exibir: Nome do Cliente (de AccessKey)
   - Deve exibir: Empresa (de AccessKey)
   - Deve exibir: Apelido (do User)

3. **Clique em "✏️ Ver Perfil Completo"**
   - Deve abrir ProfileScreen (read-only)
   - Mostra: Dados do Cliente (AccessKey)
   - Mostra: Conta de Acesso (User)
   - Mostra: Chaves Vinculadas

4. **Faça logout e login novamente**
   - AuthContext deve restaurar accessKey do AsyncStorage
   - Dados devem aparecer imediatamente

## ⚠️ Considerações

1. **Read-Only:** Usuários NÃO podem editar dados do perfil no app
   - Mudanças devem ser feitas no backend/admin

2. **Sincronização:** Ao fazer novo login, dados são atualizados
   - AccessKey é restaurado do AsyncStorage na inicialização

3. **Dados de Fallback:** SettingsScreen usa fallback se accessKey não existir
   ```javascript
   {accessKey?.clientName || user?.name || 'N/A'}
   ```

4. **Compatibilidade:** Mantém suporte a `company` object para código legado

## 🚀 Próximos Passos (Opcional)

1. Adicionar tela de admin para gerenciar AccessKeys
2. Implementar atualização de dados de cliente no backend
3. Adicionar expiração automática de AccessKey
4. Implementar multi-AccessKey por usuário (já suportado na DB)

## 📊 Benefícios

✅ Dados centralizados no servidor  
✅ Impossível corrupção de dados no cliente  
✅ Escalável para múltiplos clientes  
✅ Pronto para modelo SaaS  
✅ Segurança melhorada (dados read-only)  

---

**Data de Implementação:** 03 de Fevereiro de 2026  
**Status:** ✅ Completo (pronto para build)
