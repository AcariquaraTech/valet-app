# 🚀 Guia: Deploy Client-Admin no Railway (24h Online)

## 📋 Pré-Requisitos
- Conta no [Railway.app](https://railway.app) (já deve ter)
- Repositório GitHub sincronizado (✅ já feito)
- Seu projeto Valet já na Railway

---

## 🔧 Passo a Passo: Adicionar Client-Admin ao Railway

### **Passo 1: Acessar Railway**
1. Vá para https://railway.app
2. Login com sua conta GitHub
3. Selecione o **projeto "valet-app"**

### **Passo 2: Criar Novo Serviço**
1. Na tela do projeto, clique em **"+ New Service"**
2. Selecione **"GitHub Repo"**
3. Conectar seu repositório (já autorizado)

### **Passo 3: Selecionar Repositório e Diretório**
1. Selecione **"AcariquaraTech/valet-app"**
2. Na próxima tela, configure:
   - **Root Directory**: `client-admin`
   - **Branch**: `main`
   - Clique em **"Deploy"**

### **Passo 4: Configurar Variáveis de Ambiente**
1. Após criar o serviço, vá em **"Variables"**
2. Clique em **"+ Add Variable"**
3. Adicione:
   ```
   VITE_API_URL = https://valet-app-production.up.railway.app/api
   ```
4. Clique em **"Add"**

### **Passo 5: Configurar Build Command**
1. Na aba **"Settings"** do serviço client-admin:
2. Procure por **"Build Command"** e mude para:
   ```
   npm run build
   ```
3. Procure por **"Start Command"** e mude para:
   ```
   npm start
   ```

### **Passo 6: Atribuir Domínio (Público)**
1. Na aba **"Deployments"**
2. Clique em **"View Logs"** para ver status do build
3. Aguarde até aparecer ✅ **"Deployment Successful"**
4. Na aba **"Settings"**, procure por **"Networking"**
5. Clique em **"Generate Domain"** (Railway cria automática)
6. Cópia a URL gerada (algo como: `seu-app-client.railway.app`)

### **Passo 7: Teste de Acesso**
1. Acesse a URL gerada no navegador
2. Você deve ver a tela de login
3. Faça login com suas credenciais
4. Teste os relatórios

---

## ✅ Indicadores de Sucesso

| Status | O que significa |
|--------|---|
| 🟢 **Healthy** | Serviço rodando normalmente |
| 🟡 **Building** | Fazendo build do código |
| 🔴 **Crashed** | Erro! Verificar logs |
| ⚫ **Sleeping** | Ainda não foi acessado |

---

## 📊 Estrutura no Railway (Final)

Seu projeto terá 3 serviços:
```
valet-app (Projeto)
├── PostgreSQL (Database)
├── Backend (Node.js/Express)
├── Frontend (React Native APK)
└── Client-Admin (React/Vite) ← NOVO!
```

---

## 🔗 URLs Finais

Após deploy, você terá:

| Serviço | URL |
|---------|---|
| API Backend | `https://valet-app-production.up.railway.app` |
| Client Admin | `https://seu-app-client.railway.app` (Railway gera) |
| Mobile App | Instalado no Android (APK) |

---

## 🐛 Troubleshooting: Se der erro

### **Erro: Build Failed**
```bash
# Verifique localmente:
cd client-admin
npm install
npm run build
```

Se funcionar local mas falha no Railway, verifique:
- [ ] `package.json` tem script `build`?
- [ ] `vite.config.js` existe?
- [ ] Variáveis de ambiente configuradas?

### **Erro: Application crashed**
Verifique os logs:
1. Va para **"Deployments"**
2. Clique em **"View Logs"**
3. Procure por mensagens de erro vermelho
4. Verifique se `npm start` funciona localmente

### **Erro: Cannot find module 'serve'**
Na aba **"Settings"**, mude **"Start Command"** para:
```
npx serve -s dist -l 5173
```

### **Não conecta na API**
1. Verifique a variável `VITE_API_URL` em **"Variables"**
2. Confirme que Backend está rodando (status 🟢)
3. Abra DevTools (F12) → Console para ver erros

---

## 📈 Monitoramento Contínuo

### Acessar Logs em Tempo Real
1. Va para **"Deployments"** no Railway
2. Clique no deploy ativo
3. Ver logs por hora/minuto

### Reiniciar Serviço
Se ficar lento ou travado:
1. Va para **"Settings"** do serviço
2. Clique em **"Restart"** (sem fazer redeploy)

### Monitorar Uso de Recursos
1. Na aba **"Monitoring"**
2. Veja CPU, Memória, Disco
3. Se usar muito, Railway escalará automaticamente

---

## 🔒 Segurança em Produção

Após deploy, Railway fornece:
- ✅ HTTPS automático (SSL/TLS)
- ✅ IP fixo para integração
- ✅ Backup automático (no PostgreSQL)
- ✅ Rate limiting nativo

---

## 💰 Custo No Railway

Client-Admin no Railway usa:
- **Build**: Grátis (1x por push)
- **Runtime**: ~$5-10/mês (estimado)
- **Database**: Já compartilhado com backend
- **Domínio**: Grátis (railway.app)

Para domínio personalizado (seu-dominio.com):
- Configure CNAME no seu DNS apontando para Railway
- No Railway: **Settings** → **Networking** → **Custom Domain**

---

## 📞 Próximas Etapas

Após deploy bem-sucedido:

1. **Compartilhar URL com Cliente**
   - Envie: `https://seu-app-client.railway.app`
   - Cliente acessa 24h online

2. **Testar em Produção**
   - Login
   - Ver relatórios do dia
   - Filtrar por período

3. **Configurar Domínio Personalizado (Opcional)**
   - Usar seu domínio ao invés de railway.app

4. **Monitorar Performance**
   - Acompanhar logs
   - Verificar status regularmente

---

## ✨ Você Tem 3 Apps Rodando 24h!

```
📱 Frontend Mobile (APK - no Android do funcionário)
🖥️  Client Admin Web (Railway - seu cliente no browser)
⚙️  Backend API (Railway - processamento)
🗄️  Database (Railway - dados)
```

**Tudo em produção, seguro e escalável! 🚀**

---

Dúvidas? Abra console do navegador (F12) ou verifique logs do Railway!
