# 🚀 QUICK START - Admin Panel

## Passo 1: Instalar Dependências

```powershell
cd "e:\TRABALHOS\Estacionamento\APP VALLET\admin"
npm install
```

## Passo 2: Rodar o Backend (em outro terminal)

```powershell
cd "e:\TRABALHOS\Estacionamento\APP VALLET\backend"
npm start
```

Aguarde até ver: `APP VALET - Backend Running`

## Passo 3: Rodar o Admin Panel

```powershell
cd "e:\TRABALHOS\Estacionamento\APP VALLET\admin"
npm run dev
```

O painel vai abrir em `http://localhost:5173`

## 🔑 Login Padrão

- **Usuário:** `admin`
- **Senha:** `admin` (ou a senha que você configurou no backend)

## ✨ Funcionalidades Principais

### 1️⃣ Gerenciar Clientes (Donos de Estacionamentos)
- Criar, editar, deletar clientes
- Adicionar informações de contato, empresa, endereço, etc.
- Ver todas as chaves de acesso de um cliente

### 2️⃣ Criar Chaves de Acesso
- Código único gerado automaticamente
- Configurar: nome, email, telefone, empresa, validade, status
- Renovar validade em 1, 3, 6 ou 12 meses
- Ativar/desativar chaves

### 3️⃣ Vincular Usuários (Operadores)
- Adicionar múltiplos operadores à mesma chave
- Cada operador pode ter sua própria chave ou compartilhar
- Remover usuários quando necessário

## 📋 Fluxo Típico de Uso

1. **Criar Cliente**
   - Clique em "Novo Cliente"
   - Preencha dados do dono do estacionamento
   - Salve

2. **Criar Chave de Acesso**
   - Clique em "Nova Chave"
   - Selecione o cliente criado
   - Os dados do cliente são preenchidos automaticamente
   - Configure a data de validade e status
   - Clique em "Criar Chave"
   - Copie o código gerado
   - Compartilhe com o cliente

3. **Editar/Renovar Chave**
   - Clique no ícone de edição da chave
   - Faça as alterações necessárias
   - Clique em "Renovar" para estender a validade
   - Ou "Ativar/Desativar" para mudar o status

## 🔒 Segurança

- Toda requisição requer autenticação JWT
- Tokens são armazenados no localStorage
- Sessão expira ao fechar o navegador (recomendado)

## 🆘 Troubleshooting

### "Erro de conexão ao backend"
- Verifique se o backend está rodando em `http://localhost:3000`
- Execute `npm start` na pasta backend

### "Falha ao fazer login"
- Verifique usuário/senha (padrão: admin/admin)
- Confirme que o backend está rodando

### Não vejo dados
- Recarregue a página (F5)
- Verifique o token no localStorage
- Confira se há dados no banco de dados

## 📂 Estrutura

```
admin/
├── src/
│   ├── pages/Dashboard.jsx         # Tela principal
│   ├── components/                 # Componentes reutilizáveis
│   └── services/api.js             # Serviço de API
├── index.html                      # Arquivo HTML principal
└── package.json                    # Dependências
```

## 🎨 Customizações

Edite `admin/src/pages/Dashboard.css` para mudar cores e estilos
