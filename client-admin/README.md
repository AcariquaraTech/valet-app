# Admin Panel - APP Valet

Painel administrativo para gerenciamento de clientes, chaves de acesso e operadores.

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Funcionalidades

### 👥 Gerenciamento de Clientes
- CRUD completo de clientes (donos de estacionamentos)
- Informações detalhadas (nome, email, telefone, empresa, endereço, etc.)
- Visualizar estatísticas do cliente

### 🔑 Gerenciamento de Chaves de Acesso
- Criar chaves com código único automático
- Configurar todos os campos (nome, email, telefone, empresa, validade, status)
- Editar informações da chave
- Renovar validade (1, 3, 6 ou 12 meses)
- Ativar/desativar chaves
- Vincular múltiplos usuários/operadores à mesma chave
- Deletar chaves

### 👨‍💼 Vinculação de Usuários
- Vincular operadores à chave de acesso
- Gerenciar permissões de acesso
- Desvincular usuários quando necessário

## Estrutura de Pastas

```
admin/
├── src/
│   ├── pages/
│   │   └── Dashboard.jsx          # Página principal
│   ├── components/
│   │   ├── ClientModal.jsx        # Modal CRUD de clientes
│   │   ├── AccessKeyModal.jsx     # Modal de criação de chaves
│   │   ├── ClientDetailsModal.jsx # Modal de edição e detalhes
│   │   └── Modal.css
│   ├── services/
│   │   └── api.js                 # Serviço de API
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Conexão com Backend

- Backend deve estar rodando em `http://localhost:3000`
- É necessário estar autenticado para acessar o painel
- Usa o token JWT salvo no localStorage

## Endpoints Utilizados

- `POST /api/auth/login` - Login do admin
- `GET /api/admin/clients` - Listar clientes
- `POST /api/admin/clients` - Criar cliente
- `PUT /api/admin/clients/:id` - Atualizar cliente
- `DELETE /api/admin/clients/:id` - Deletar cliente
- `GET /api/admin/access-keys` - Listar chaves
- `POST /api/admin/access-keys` - Criar chave
- `PUT /api/admin/access-keys/:id` - Atualizar chave
- `DELETE /api/admin/access-keys/:id` - Deletar chave
- `PATCH /api/admin/access-keys/:id/activate` - Ativar chave
- `PATCH /api/admin/access-keys/:id/deactivate` - Desativar chave
- `PATCH /api/admin/access-keys/:id/renew` - Renovar chave
- `POST /api/admin/access-keys/:id/bind-user/:userId` - Vincular usuário
- `DELETE /api/admin/access-keys/:id/unbind-user/:userId` - Desvincular usuário
