# 🚀 Deploy Backend no Render.com

⚠️ **ATENÇÃO: PostgreSQL Free Tier expira em 90 dias e DELETA todos os dados!**

📖 **Leia antes de continuar:**
- [GARANTIA_DADOS.md](GARANTIA_DADOS.md) - Como garantir que não vai perder dados
- [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md) - Alternativa mais simples ($5-10/mês, sem expiração)

---

## ✅ Migração Concluída
Seu backend agora usa **PostgreSQL** em vez de SQLite, garantindo persistência de dados no Render.

---

## 📋 Passo a Passo - Deploy no Render

### 1️⃣ Preparar Repositório Git

Se ainda não tem Git configurado:

```bash
cd "E:\TRABALHOS\Estacionamento\APP VALLET"
git init
git add .
git commit -m "Migração para PostgreSQL + Deploy ready"
```

**Importante:** Criar arquivo `.gitignore` na raiz:
```
node_modules/
*.db
*.db-journal
.env
frontend/android/build/
frontend/android/.gradle/
backend/prisma/dev.db
```

Depois faça push para GitHub, GitLab ou Bitbucket.

---

### 2️⃣ Criar Conta no Render

1. Acesse: [https://render.com](https://render.com)
2. Crie conta (pode usar conta GitHub)
3. Verifique email

---

### 3️⃣ Criar PostgreSQL Database

1. No dashboard do Render, clique **"New +"** → **"PostgreSQL"**
2. Configurações:
   - **Name**: `appvalet-db` (ou qualquer nome)
   - **Database**: `appvalet`
   - **User**: `appvalet` (automático)
   - **Region**: Escolha mais próximo (ex: Ohio ou Oregon)
   - **PostgreSQL Version**: 16 (ou mais recente)
   - **Plan**: **Free** (limite: 90 dias, depois expira - **atenção!**)
     - Se precisar permanente: escolher plano $7/mês (~R$ 35/mês)
3. Clique **"Create Database"**
4. **Aguarde ~2 minutos** até status ficar "Available"
5. **COPIE** a **Internal Database URL** (ex: `postgresql://appvalet:abc123...@dpg-xyz.oregon-postgres.render.com/appvalet`)

---

### 4️⃣ Criar Web Service (Backend)

1. No dashboard, clique **"New +"** → **"Web Service"**
2. **Conectar Repositório**:
   - Se GitHub: autorize Render a acessar
   - Selecione o repositório do projeto
3. **Configurações**:
   - **Name**: `appvalet-backend`
   - **Region**: **Mesma região do banco** (ex: Oregon)
   - **Branch**: `main` ou `master`
   - **Root Directory**: `backend` (importante!)
   - **Runtime**: **Node**
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: **Free** (backend dorme após 15 min sem uso)
     - Se precisar sempre online: escolher plano $7/mês (~R$ 35/mês)

4. **Environment Variables** (clique em "Advanced"):
   
   Adicione cada uma abaixo:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `DATABASE_URL` | *Cole a Internal Database URL do passo 3* |
   | `JWT_SECRET` | `mude_para_algo_super_secreto_producao_12345` |
   | `JWT_EXPIRY` | `365d` |
   | `ALLOWED_ORIGINS` | `*` (ou seu domínio frontend) |
   | `TWILIO_ACCOUNT_SID` | `seu_sid_aqui` (se usar SMS) |
   | `TWILIO_AUTH_TOKEN` | `seu_token_aqui` (se usar SMS) |
   | `TWILIO_PHONE_NUMBER` | `+5511999999999` |

5. Clique **"Create Web Service"**

---

### 5️⃣ Deploy Automático

- Render vai:
  1. Instalar dependências (`npm install`)
  2. Gerar Prisma Client (`npx prisma generate`)
  3. Rodar migrations (`npx prisma migrate deploy`)
  4. Iniciar servidor (`npm start`)

- **Acompanhe os logs** na interface do Render
- Primeiro deploy demora ~5 minutos

---

### 6️⃣ Testar Backend

Quando deploy terminar, você verá:
- **URL**: `https://appvalet-backend.onrender.com`

Teste no navegador:
```
https://appvalet-backend.onrender.com/health
```

Deve retornar: `{"status": "ok"}`

---

### 7️⃣ Atualizar Frontend

Edite o arquivo `frontend/src/services/apiClient.js`:

```javascript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000'  // Android emulator local
  : 'https://appvalet-backend.onrender.com'; // Produção Render
```

Ou crie variável de ambiente no Expo:

**app.json** ou **app.config.js**:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://appvalet-backend.onrender.com"
    }
  }
}
```

**apiClient.js**:
```javascript
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000';
```

---

### 8️⃣ Popular Banco de Dados

Se precisar rodar seed inicial, use o **Shell do Render**:

1. Na página do Web Service, vá em **"Shell"** (menu lateral)
2. Execute:
```bash
cd backend
npm run seed
```

Ou crie um script de seed via API REST.

---

## 🔄 Deploy Contínuo

A partir de agora:
- **Cada push** no GitHub → Render faz deploy automático
- Logs disponíveis no dashboard
- Rollback disponível para versões anteriores

---

## ⚠️ Limitações Tier Gratuito

### Free Web Service:
- ✅ 750 horas/mês (suficiente para 1 serviço 24/7)
- ⚠️ **Backend dorme após 15 min inativo**
  - Primeira requisição após dormir: ~30 segundos
  - Solução: plano pago $7/mês (~R$ 35/mês) ou ping a cada 10 min

### Free PostgreSQL:
- ✅ 1GB storage
- ⚠️ **Expira após 90 dias**
  - Precisa recriar banco (dados perdidos)
  - Solução: plano pago $7/mês (~R$ 35/mês) para permanente

---

## 💡 Dicas

1. **Logs**: Sempre monitore logs no Render para erros
2. **Migrations**: Sempre testar localmente antes de deploy
3. **Backups**: Render free não faz backup automático - exporte dados periodicamente
4. **Domínio Customizado**: Pode adicionar domínio próprio (ex: api.seuapp.com)
5. **Health Check**: Render faz ping em `/` a cada 5 min - adicione endpoint `/health`

---

## 🆘 Troubleshooting

### Erro: "relation does not exist"
- Migrations não rodaram
- Solução: No shell do Render: `npx prisma migrate deploy --force`

### Erro: "connect ECONNREFUSED"
- DATABASE_URL incorreto
- Solução: Copie novamente a Internal Database URL (não a External)

### Backend não acorda
- Tier gratuito dorme após inatividade
- Solução: Esperar 30s na primeira requisição ou upgrade para plano pago

### Logs não aparecem
- Pode estar buildando ainda
- Solução: Aguardar "Build succeeded" e "Live" aparecer

---

## 📊 Monitoramento

No dashboard Render você vê:
- CPU/RAM usage
- Request count
- Error rate
- Build logs
- Runtime logs

---

## 🎯 Próximos Passos

Após deploy funcionando:
1. Configurar CI/CD mais avançado
2. Adicionar monitoring (Sentry, LogRocket)
3. Configurar backups automáticos
4. Adicionar Redis para cache (opcional)
5. Configurar domínio customizado

---

## 💰 Custos Reais

**Opção 1 - Totalmente Grátis:**
- Web Service Free + PostgreSQL Free
- **Limitação**: Backend dorme + Banco expira em 90 dias

**Opção 2 - Produção Confiável ($14/mês):**
- Web Service: $7/mês (sempre online)
- PostgreSQL: $7/mês (permanente + backups)

**Opção 3 - Railway ($5-10/mês):**
- Backend + PostgreSQL incluídos
- Mais simples, menos limitações

---

## ✅ Checklist Final

- [ ] Git configurado e código commitado
- [ ] Repositório no GitHub/GitLab
- [ ] Conta Render criada
- [ ] PostgreSQL database criado
- [ ] Internal Database URL copiada
- [ ] Web Service criado com variáveis de ambiente
- [ ] Deploy concluído (status "Live")
- [ ] Endpoint `/health` respondendo
- [ ] Frontend atualizado com URL de produção
- [ ] APK recompilado e testado

---

**Seu backend está pronto para produção! 🎉**

Qualquer dúvida durante o deploy, me chame!
