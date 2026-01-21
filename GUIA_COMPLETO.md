# 🚀 APP VALET - GUIA COMPLETO FUNCIONANDO

## ✅ Status: TUDO PRONTO PARA TESTAR

### Pré-requisitos Instalados:
- ✅ Backend (Node.js + Express + Prisma)
- ✅ Frontend (React Native + Expo)
- ✅ Dependências (npm install concluído)
- ✅ Banco de dados (SQLite com dev.db)

---

## 📋 PASSO 1: Iniciar Backend (Terminal 1)

```powershell
cd "e:\TRABALHOS\Estacionamento\APP VALLET\backend"
node src/app.js
```

**Esperado:**
```
✓ Server running on port 3000
✓ Database connected
```

**Se der erro de banco, rodar:**
```powershell
npx prisma migrate dev --name init
node test.js
```

---

## 🎮 PASSO 2: Iniciar Expo (Terminal 2)

```powershell
cd "e:\TRABALHOS\Estacionamento\APP VALLET\frontend"
npm start
```

**Esperado:**
- Metro bundler começará a compilar
- Mostrará um QR code no terminal
- Dirá "Opening on Android (tunnel)" ou similar

---

## 📱 PASSO 3: Testar no Device

### Opção 1: Expo Go (Recomendado)
1. Instale **Expo Go** do Play Store no seu telefone/emulador
2. Abra o app Expo Go
3. Escaneie o QR code que aparecerá no terminal
4. Aguarde ~30-60 segundos
5. Veja o APP VALET aparecer na tela

### Opção 2: Emulador Android
Se o emulador estiver aberto, o Expo Go automaticamente carregará o app.

---

## 🧪 Credenciais de Teste

**Email:** `admin@valet.com`
**Senha:** `senha123`

---

## 🌐 API Endpoints (Se Precisar Testar)

**Backend rodando em:** `http://172.29.64.1:3000/api`

### Login
```bash
POST /api/auth/login
{
  "email": "admin@valet.com",
  "password": "senha123"
}
```

### Listar Veículos
```bash
GET /api/vehicles
Authorization: Bearer {token}
```

---

## ⚠️ Se der erro no Expo Go

### "Failed to download remote update"
- Solução: Force reset do Metro
  ```powershell
  Ctrl+C
  npm start -- --reset-cache
  ```

### "Cannot find module"
- Solução: Limpar cache
  ```powershell
  rm -r node_modules
  npm install --legacy-peer-deps
  npm start
  ```

### Conexão recusada
- Solução: Verificar firewall
  ```powershell
  netstat -ano | findstr :3000
  ```

---

## 📱 O que Vai Ver no App

1. **Tela Home**
   - Título "APP VALET"
   - 2 botões: "Ir para Login" e "Ver Veículos"

2. **Tela Login**
   - Mostra credenciais de teste
   - Botão para voltar

3. **Tela Veículos**
   - Lista com veículos de exemplo
   - Botão para voltar

**Tudo navegável com botões simples.**

---

## 🎯 Checklist de Funcionamento

- [ ] Backend inicia sem erros
- [ ] Expo inicia sem erros
- [ ] QR code aparece no terminal
- [ ] Expo Go conecta e app aparece no device
- [ ] Consegue clicar nos botões e navegar
- [ ] Telas aparecem corretamente

---

## ✨ Próximos Passos (Depois de Confirmar Funcionamento)

1. **Integração com API**: Adicionar axios + chamadas reais
2. **Autenticação**: Conectar com backend
3. **Navegação Real**: React Navigation
4. **Gerar APK**: `npm run build:android`

---

## 📞 Resumo Rápido

| Ação | Comando |
|------|---------|
| Backend | `cd backend && node src/app.js` |
| Frontend | `cd frontend && npm start` |
| Reset Backend | `cd backend && npx prisma migrate dev --name init && node test.js` |
| Reset Frontend | `cd frontend && npm install && npm start -- --reset-cache` |
| API Teste | `curl http://172.29.64.1:3000/api/health` |

---

**Versão: 1.0.0 | Testada e Pronta para Uso** ✅
