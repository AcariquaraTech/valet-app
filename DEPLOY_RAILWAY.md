# 🚂 Deploy no Railway.app - Alternativa Mais Simples

Railway é **mais fácil que Render** e tem **melhor custo-benefício** para seu app.

---

## ✅ Por Que Railway?

- ✅ Backend + PostgreSQL por **$5-10/mês (~R$ 25-50/mês)** (tudo incluído)
- ✅ **Backend NÃO dorme** (sempre online, sem delay)
- ✅ **PostgreSQL permanente** (não expira)
- ✅ **Backups automáticos** incluídos
- ✅ Deploy mais simples (1 clique)
- ✅ $5 de crédito grátis (~R$ 25) para começar
- ✅ Pay-as-you-go (paga só o que usar)

---

## 📋 Passo a Passo

### 1️⃣ Criar Conta

1. Acesse [railway.app](https://railway.app)
2. "Login" → Usar conta GitHub
3. Verifique email

---

### 2️⃣ Criar Novo Projeto

1. Dashboard → **"New Project"**
2. Escolha **"Deploy PostgreSQL"**
3. Aguarde ~30 segundos (database será criado)

---

### 3️⃣ Adicionar Backend

1. No mesmo projeto, clique **"+ New"**
2. Escolha **"GitHub Repo"**
3. Autorize Railway a acessar GitHub
4. Selecione repositório: `seu-usuario/app-valet`
5. Clique **"Deploy"**

---

### 4️⃣ Configurar Backend

1. Clique no serviço do backend (não no PostgreSQL)
2. Vá em **"Settings"**
3. Configure:

**Root Directory:**
```
backend
```

**Build Command:** (Railway detecta automaticamente, mas pode forçar)
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```bash
npm start
```

**Watch Paths:** (opcional - só fazer redeploy quando backend mudar)
```
backend/**
```

---

### 5️⃣ Conectar Banco ao Backend

Railway faz isso **automaticamente**! Mas vamos verificar:

1. Clique no serviço do **Backend**
2. Vá em **"Variables"**
3. Verifique se existe: `DATABASE_URL`
4. Se NÃO existir:
   - Clique **"+ New Variable"**
   - Escolha **"Add Reference"**
   - Selecione PostgreSQL → `DATABASE_URL`
   - Salve

---

### 6️⃣ Adicionar Outras Variáveis

No serviço do Backend, aba **"Variables"**, adicione:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=mude_para_algo_super_secreto_railway_123
JWT_EXPIRY=365d
ALLOWED_ORIGINS=*
```

Se usar Twilio (SMS):
```bash
TWILIO_ACCOUNT_SID=seu_sid_aqui
TWILIO_AUTH_TOKEN=seu_token_aqui
TWILIO_PHONE_NUMBER=+5511999999999
```

---

### 7️⃣ Deploy!

Railway vai automaticamente:
1. ✅ Instalar dependências
2. ✅ Gerar Prisma Client
3. ✅ Rodar migrations
4. ✅ Iniciar servidor

Acompanhe logs na aba **"Deployments"**.

---

### 8️⃣ Obter URL do Backend

1. Clique no serviço do **Backend**
2. Vá em **"Settings"**
3. Role até **"Networking"**
4. Clique **"Generate Domain"**
5. Railway vai criar: `seu-app.up.railway.app`

Teste no navegador:
```
https://seu-app.up.railway.app/health
```

---

### 9️⃣ Atualizar Frontend

Edite `frontend/src/services/apiClient.js`:

```javascript
// Opção 1: Hardcoded
const API_URL = 'https://seu-app.up.railway.app/api';

// Opção 2: Com detecção de ambiente
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Local (Android Emulator)
  : 'https://seu-app.up.railway.app/api'; // Produção
```

Recompile o APK:
```bash
cd frontend/android
.\gradlew.bat assembleRelease --no-daemon
```

---

### 🔟 Popular Banco de Dados

Opção 1 - **Via Railway CLI:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ligar projeto
railway link

# Rodar seed
railway run npm run seed
```

Opção 2 - **Via Shell no Dashboard:**

1. No serviço Backend → aba **"Shell"**
2. Execute:
```bash
npm run seed
```

---

## 🔄 Deploy Contínuo

Cada **push no GitHub** → Railway faz deploy automático!

```bash
git add .
git commit -m "Atualização do backend"
git push origin main
```

Railway vai detectar mudança e fazer redeploy em ~2 minutos.

---

## 💰 Custos

Railway usa **créditos** baseado no uso real:

**Cálculo Estimado:**
- Backend (512MB RAM, sempre online): ~$5/mês (~R$ 25/mês)
- PostgreSQL (1GB storage): ~$5/mês (~R$ 25/mês)
- **TOTAL: ~$10/mês (~R$ 50/mês)**

**Primeiro mês:** $5 de crédito grátis (~R$ 25)! 🎉

**Observação:** Cotação aproximada USD 1,00 = R$ 5,00

Você pode monitorar uso real no dashboard.

---

## 📊 Monitoramento

Dashboard Railway mostra:
- ✅ CPU/RAM em tempo real
- ✅ Requests por minuto
- ✅ Logs em tempo real
- ✅ Custo atual do mês
- ✅ Histórico de deploys

---

## 🔐 Backups

Railway faz **snapshots automáticos** do PostgreSQL!

**Para fazer backup manual:**

1. No serviço PostgreSQL → aba **"Data"**
2. Clique **"Download Backup"**
3. Salva arquivo `.sql`

**Para restaurar:**
1. Upload do arquivo SQL
2. Ou usar Railway CLI:
```bash
railway run psql $DATABASE_URL < backup.sql
```

---

## 🆘 Troubleshooting

### Backend não inicia
- Verifique logs na aba "Deployments"
- Confirme que `DATABASE_URL` está configurada
- Confirme que migrations rodaram: `npx prisma migrate deploy`

### Erro: "relation does not exist"
- Migrations não rodaram
- No shell: `npx prisma migrate deploy --force`

### Backend lento
- Upgrade para plano maior (mais RAM/CPU)
- Railway dashboard → Settings → aumente limites

---

## 🎯 Vantagens vs Render

| Feature | Railway | Render Free |
|---------|---------|-------------|
| **Backend Sleep** | ❌ Nunca | ✅ Após 15min |
| **PostgreSQL Permanente** | ✅ Sim | ❌ 90 dias |
| **Backups Auto** | ✅ Sim | ❌ Não |
| **Deploy Speed** | ⚡ ~2min | 🐌 ~5min |
| **Custo** | $10/mês (~R$ 50) | $0 (limitado) |
| **Configuração** | 🟢 Fácil | 🟡 Médio |

---

## 🚀 Próximos Passos

Após deploy funcionando:

1. **Domínio Customizado** (opcional):
   - Settings → Custom Domain
   - Adicionar: `api.seuapp.com`
   - Configurar DNS

2. **Variáveis de Ambiente Dinâmicas:**
   - Usar Railway Plugin Variables
   - Configurar diferentes envs (staging/production)

3. **Monitoramento Avançado:**
   - Integrar com Sentry (erros)
   - Configurar alertas via email/Slack

4. **Scaling:**
   - Railway escala automaticamente
   - Pode adicionar mais replicas se necessário

---

## ✅ Checklist Final

- [ ] Conta Railway criada
- [ ] PostgreSQL database criado
- [ ] Backend conectado ao repositório Git
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído (status "Success")
- [ ] Domain gerado e testado (`/health` responde)
- [ ] Migrations rodaram com sucesso
- [ ] Banco populado com seed (opcional)
- [ ] Frontend atualizado com URL de produção
- [ ] APK recompilado e testado

---

## 💡 Dica Final

Railway é **mais caro que Render Free** ($10/mês = ~R$ 50/mês vs $0), mas:
- Seu backend **nunca dorme** = melhor UX
- Banco **nunca expira** = dados seguros
- Backups **automáticos** = tranquilidade
- Deploy **mais rápido** = produtividade

**Vale cada centavo!** Menos que uma pizza por mês para ter dados seguros. 💰→😴

---

**Precisa de ajuda com deploy? Me chame! 🚀**
