# Isolamento de Usuários no Painel Admin

## Problema Identificado

O painel administrativo estava listando **todos os usuários** do banco de dados quando o administrador tentava vincular usuários a uma chave de acesso. Isso causava a mistura de usuários de diferentes empresas/clientes, violando o isolamento multi-tenant.

### Exemplo do problema:
```
Empresa A (Cliente ID: abc-123)
  └── Chave de Acesso 1
       └── Usuário: admin (já vinculado)

Empresa B (Cliente ID: xyz-789)  
  └── Chave de Acesso 2
       └── Usuário: admin (já vinculado)

❌ Ao criar novo usuário na Chave 1, sistema mostrava:
   - admin (Empresa A)
   - admin (Empresa B)  <-- NÃO DEVERIA APARECER!
```

## Solução Implementada

### 1. Novo Endpoint no Backend

**Rota**: `GET /api/admin/access-keys/:id/available-users`

**Localização**: `backend/src/controllers/accessKeyAdminController.js`

**Lógica**:
```javascript
export const getAvailableUsers = async (req, res) => {
  // 1. Busca a access key para obter o clientId
  const accessKey = await prisma.accessKey.findUnique({
    where: { id },
    select: { clientId: true },
  });

  // 2. Busca todos os usuários com suas access keys
  const allUsers = await prisma.user.findMany({
    select: {
      id, nickname, name, phone, email, role, active,
      accessKeys: { select: { clientId: true } }
    }
  });

  // 3. Filtra usuários disponíveis:
  const availableUsers = allUsers.filter((user) => {
    // Usuários livres (sem access key)
    if (user.accessKeys.length === 0) return true;
    
    // Usuários do mesmo cliente
    return user.accessKeys.some((ak) => ak.clientId === accessKey.clientId);
  });

  // 4. Remove campo accessKeys do retorno
  return cleanedUsers;
};
```

### 2. Integração no Frontend

**Arquivo**: `admin/src/components/ClientDetailsModal.jsx`

**Mudanças**:

#### Antes:
```javascript
// ❌ Buscava TODOS os usuários
const usersRes = await userService.listUsers();
setAllUsers(usersRes.data || []);
```

#### Depois:
```javascript
// ✅ Busca apenas usuários disponíveis (livres + mesmo cliente)
const availableUsersRes = await accessKeyService.getAvailableUsers(client.id);
setAllUsers(availableUsersRes.data || []);
```

### 3. Service Layer

**Arquivo**: `admin/src/services/api.js`

```javascript
export const accessKeyService = {
  // Novo método adicionado
  getAvailableUsers: async (keyId) => {
    const response = await axios.get(
      `${API_BASE_URL}/access-keys/${keyId}/available-users`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
```

## Regras de Negócio

### Usuários que aparecem na lista "Vincular usuário existente":

1. **Usuários Livres**: Não estão vinculados a nenhuma access key
   - Podem ser vinculados a qualquer cliente
   - Útil para novos usuários criados sem access key

2. **Usuários do Mesmo Cliente**: Já vinculados a outras access keys do mesmo clientId
   - Exemplo: Usuário vinculado à "Chave Principal" pode ser vinculado também à "Chave Reserva"
   - Ambas as chaves pertencem ao mesmo cliente

### Usuários que NÃO aparecem:

1. **Usuários de Outros Clientes**: Vinculados a access keys de clientId diferente
   - Garante isolamento entre empresas
   - Previne vazamento de dados entre clientes

2. **Usuários Já Vinculados**: Já aparece na lista "Usuários Vinculados" acima
   - O select box automaticamente filtra usando: 
     ```javascript
     .filter((u) => !users.some((ku) => ku.id === u.id))
     ```

## Fluxo de Trabalho

### Cenário 1: Criar novo usuário
```
1. Admin abre modal de detalhes da Access Key
2. Preenche formulário "Criar e vincular novo usuário"
3. Backend:
   - Valida nickname único no escopo do cliente
   - Cria usuário vinculado à access key
4. Frontend recarrega:
   - Usuários vinculados (getKeyUsers)
   - Usuários disponíveis (getAvailableUsers)
```

### Cenário 2: Vincular usuário existente
```
1. Admin seleciona usuário do dropdown "Vincular usuário existente"
2. Dropdown mostra apenas:
   - Usuários livres
   - Usuários do mesmo cliente (não vinculados a esta key)
3. Backend vincula usuário à access key
4. Frontend atualiza listas
```

### Cenário 3: Desvincular usuário
```
1. Admin clica "Remover" em usuário vinculado
2. Backend desvincula (many-to-many disconnect)
3. Frontend atualiza:
   - Remove da lista "Usuários Vinculados"
   - Adiciona à lista "Vincular usuário existente"
```

## Arquivos Modificados

### Backend:
- `backend/src/controllers/accessKeyAdminController.js` - Novo método `getAvailableUsers`
- `backend/src/routes/accessKeyAdminRoutes.js` - Nova rota `GET /:id/available-users`

### Frontend:
- `admin/src/services/api.js` - Novo método `getAvailableUsers`
- `admin/src/components/ClientDetailsModal.jsx`:
  - useEffect: troca `userService.listUsers()` por `accessKeyService.getAvailableUsers()`
  - handleBindUser: atualiza ambas as listas
  - handleUnbindUser: atualiza ambas as listas
  - handleCreateUser: atualiza ambas as listas

## Testes Recomendados

### Teste 1: Isolamento entre clientes
```
1. Criar Cliente A com Chave 1
2. Criar Cliente B com Chave 2
3. Criar usuário "admin" na Chave 1
4. Abrir detalhes da Chave 2
5. ✅ Verificar que "admin" NÃO aparece no dropdown
```

### Teste 2: Usuários livres
```
1. Criar usuário sem access key via endpoint direto
2. Abrir detalhes de qualquer Chave
3. ✅ Usuário deve aparecer no dropdown
```

### Teste 3: Múltiplas chaves mesmo cliente
```
1. Criar Cliente A com Chave 1 e Chave 2
2. Vincular "admin" à Chave 1
3. Abrir detalhes da Chave 2
4. ✅ "admin" deve aparecer no dropdown
5. Vincular "admin" à Chave 2
6. ✅ "admin" deve aparecer em ambas as chaves
```

### Teste 4: Criação de usuário duplicado
```
1. Criar usuário "operador" na Chave 1 (Cliente A)
2. Criar usuário "operador" na Chave 2 (Cliente B)
3. ✅ Ambos devem ser criados com sucesso (nicknames isolados por cliente)
```

## Benefícios

1. **Segurança**: Impede acesso cruzado entre clientes
2. **Usabilidade**: Dropdown mostra apenas usuários relevantes
3. **Flexibilidade**: Permite usuários livres e compartilhados no mesmo cliente
4. **Conformidade**: Atende requisitos de multi-tenancy

## Próximos Passos

- [ ] Adicionar testes automatizados para o endpoint `getAvailableUsers`
- [ ] Adicionar loading states no frontend durante busca de usuários
- [ ] Implementar filtro/busca por nome no dropdown de usuários
- [ ] Adicionar indicador visual de "usuário livre" vs "usuário do mesmo cliente"
