# 🆘 TROUBLESHOOTING - APP VALET

## ⚡ Problemas Comuns e Soluções

---

## 🔴 Problema 1: "Cannot find module" no Expo

### Sintomas:
```
Error: Cannot find module 'react-native'
Cannot find module 'expo'
```

### ✅ Solução:
```powershell
# 1. Parar o Expo (Ctrl+C)
# 2. Limpar node_modules
cd "e:\TRABALHOS\Estacionamento\APP VALLET\frontend"
rm -r node_modules
rm -r .expo

# 3. Reinstalar
npm install --legacy-peer-deps

# 4. Iniciar com reset
npm start -- --reset-cache
```

---

## 🔴 Problema 2: "Tunnel connection failed"

### Sintomas:
```
Failed to establish tunnel
Connection refused
```

### ✅ Solução:
```powershell
# 1. Reiniciar Expo sem tunnel
npm start

# 2. Ou usar LAN mode
npm start -- --lan

# 3. Ou usar localhost (apenas local)
npm start -- --localhost
```

---

## 🔴 Problema 3: "Expo Go app not connecting"

### Sintomas:
- QR code aparece mas app não carrega
- "Failed to download remote update"
- "Unable to load bundle"

### ✅ Solução:
```powershell
# 1. Verificar se backend está rodando
netstat -ano | findstr :3000

# 2. Verificar firewall
# Tipo: Entrar em Windows Defender Firewall
# Adicionar exceção para Node.js

# 3. Tentar LAN connection
npm start -- --lan

# 4. Se ainda não funcionar, resetar Expo
npm start -- --reset-cache --clear

# 5. Último recurso: reinstalar Expo Go no telefone
# Desinstale do Play Store e reinstale
```

---

## 🔴 Problema 4: Backend não responde

### Sintomas:
```
Connection refused port 3000
Cannot GET /api/vehicles
```

### ✅ Solução:
```powershell
# 1. Verificar se está rodando
netstat -ano | findstr :3000

# 2. Se não aparecer, iniciar backend
cd "e:\TRABALHOS\Estacionamento\APP VALLET\backend"
node src/app.js

# 3. Se der erro, resetar banco
npx prisma migrate reset --force
npx prisma migrate dev --name init
node test.js

# 4. Então iniciar
node src/app.js
```

---

## 🔴 Problema 5: "Database not found"

### Sintomas:
```
Error: ENOENT: no such file or directory, open 'dev.db'
Prisma client error
```

### ✅ Solução:
```powershell
# 1. Ir para backend
cd "e:\TRABALHOS\Estacionamento\APP VALLET\backend"

# 2. Criar banco
npx prisma migrate dev --name init

# 3. Seedar dados
node test.js

# 4. Verificar
ls prisma/  # Deve aparecer dev.db

# 5. Iniciar backend
node src/app.js
```

---

## 🔴 Problema 6: "Invalid JSON response" da API

### Sintomas:
```
Unexpected token < in JSON at position 0
Response is HTML, not JSON
```

### ✅ Solução:
```powershell
# 1. Verificar logs do backend
# Ver o que ele está imprimindo

# 2. Testar endpoint direto
curl http://localhost:3000/api/auth/login

# 3. Se retornar HTML (erro), verificar
cd "e:\TRABALHOS\Estacionamento\APP VALLET\backend"
node src/app.js

# 4. Copiar erro do terminal
```

---

## 🔴 Problema 7: App carrega branco/não mostra nada

### Sintomas:
- Tela em branco
- Nenhum erro no Metro
- App não responde

### ✅ Solução:
```javascript
// 1. Adicionar debug em App.js
console.log('App loaded');
console.log('Screen:', screen);

// 2. Reiniciar Metro
npm start -- --reset-cache

// 3. No app, apertar R (reload)

// 4. Se continuar branco, verificar
// Arquivo App.js está correto?
cat App.js | head -20
```

---

## 🔴 Problema 8: "Port 3000 already in use"

### Sintomas:
```
Error: listen EADDRINUSE: address already in use :::3000
```

### ✅ Solução:
```powershell
# 1. Matar processo na porta 3000
netstat -ano | findstr :3000
# Copiar o PID (número)

# 2. Matar o processo
taskkill /PID <numero> /F

# 3. Verificar se liberou
netstat -ano | findstr :3000

# 4. Iniciar novamente
node src/app.js
```

---

## 🔴 Problema 9: Expo Metro "stuck" compilando

### Sintomas:
```
Metro waiting on exp://...
(vai compilando para sempre)
```

### ✅ Solução:
```powershell
# 1. Pressionar Q para sair
Q

# 2. Limpar cache completo
npm start -- --reset-cache

# 3. Ou reiniciar PowerShell
# Fechar o terminal e abrir novo
cd "e:\TRABALHOS\Estacionamento\APP VALLET\frontend"
npm start
```

---

## 🔴 Problema 10: "Cannot read property of undefined"

### Sintomas:
```
TypeError: Cannot read property 'field' of undefined
```

### ✅ Solução:
```javascript
// 1. Adicionar default values
const state = data || { field: 'default' };

// 2. Usar optional chaining
const value = data?.field ?? 'default';

// 3. Verificar imports
console.log('Data:', data);
console.log('Type:', typeof data);
```

---

## 🆘 Checklist de Diagnóstico Rápido

```powershell
# ✅ Verificar Backend
netstat -ano | findstr :3000           # Porta aberta?
curl http://localhost:3000/api/health  # Responde?

# ✅ Verificar Frontend
ls "e:\TRABALHOS\Estacionamento\APP VALLET\frontend\App.js"  # Arquivo existe?
npm list react react-native            # Deps instaladas?

# ✅ Verificar Banco
ls "e:\TRABALHOS\Estacionamento\APP VALLET\backend\prisma\dev.db"  # DB existe?

# ✅ Verificar Firewall
# Windows Defender → Gerenciar aplicativos → Node.js deve estar autorizado
```

---

## 📞 Se Nada Funcionar

### Reset Completo (Nuclear Option):

```powershell
# 1. Backend
cd "e:\TRABALHOS\Estacionamento\APP VALLET\backend"
rm -r node_modules
rm package-lock.json
npm install
npx prisma migrate reset --force
npx prisma migrate dev --name init
node test.js

# 2. Frontend
cd "e:\TRABALHOS\Estacionamento\APP VALLET\frontend"
rm -r node_modules
rm -r .expo
rm package-lock.json
npm install --legacy-peer-deps

# 3. Iniciar
# Terminal 1
cd backend && node src/app.js

# Terminal 2
cd frontend && npm start -- --reset-cache
```

---

## 🎯 Teste Rápido

```powershell
# Se quiser testar só o backend (sem app)
# Abrir PowerShell novo

# 1. Backend rodando?
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@valet.com",
    "password": "senha123"
  }'

# Deve retornar um token JSON se funcionar
```

---

## 📊 Logs Úteis Para Salvar

```powershell
# Salvar erro do backend
node src/app.js 2>&1 | tee backend.log

# Salvar erro do Expo
npm start 2>&1 | tee expo.log

# Depois, compartilhar o arquivo .log
```

---

## 🎯 Contato/Ajuda

Se depois de tentar tudo ainda não funcionar:

1. **Copiar erro exato** que aparece no terminal
2. **Verificar logs** em backend.log ou expo.log
3. **Descrever o que tentou** fazer
4. **Informar SO e versões** (Node, npm, etc)

```powershell
# Para saber versões
node --version      # Node.js
npm --version       # npm
npx expo --version  # Expo
```

---

## ✅ Confirmação de Sucesso

Se tudo está funcionando, você deve ver:

```
Backend:
✓ Express running on port 3000
✓ Database connected

Frontend:
✓ Metro Bundler
✓ QR code gerado
✓ Waiting for connection...

App:
✓ Expo Go conectado
✓ APP VALET na tela
✓ Botões respondendo
```

---

**Última atualização:** $(date)
**Versão:** 1.0.0 | Support Ready ✅
