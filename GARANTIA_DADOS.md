# 🛡️ Garantia de Dados - Nunca Perder o Banco

## ⚠️ PROBLEMA CRÍTICO

**Render Free PostgreSQL expira em 90 dias e DELETA TUDO!**

Isso significa que após 3 meses, todos os veículos, entradas, saídas e clientes cadastrados **serão perdidos permanentemente**.

---

## ✅ SOLUÇÕES PERMANENTES

### **Opção 1: Render PostgreSQL Pago - $7/mês ⭐**

**Vantagens:**
- ✅ **Banco permanente** (não expira nunca)
- ✅ **Backups automáticos diários** (últimos 7 dias)
- ✅ **Point-in-time recovery** (restaurar qualquer momento)
- ✅ **1 GB storage** (suficiente para ~50.000 veículos)
- ✅ Conexões ilimitadas
- ✅ Suporte técnico

**Como Contratar:**
1. No dashboard Render, vá no seu PostgreSQL database
2. Clique em "Upgrade"
3. Selecione plano **Starter - $7/mês**
4. Pronto! Backups automáticos ativados

**Custos Totais:**
- Web Service (backend): **Grátis** (com sleep)
- PostgreSQL: **$7/mês (~R$ 35/mês)**
- **TOTAL: $7/mês (~R$ 35/mês)**

---

### **Opção 2: Railway.app - $5-10/mês ⭐⭐**

**Vantagens:**
- ✅ Backend + PostgreSQL incluídos no mesmo plano
- ✅ **Backend NÃO dorme** (sempre online)
- ✅ Backups automáticos incluídos
- ✅ Deploy mais simples que Render
- ✅ $5 de crédito grátis para testar

**Como Configurar:**
1. Criar conta em [railway.app](https://railway.app)
2. "New Project" → "Deploy PostgreSQL"
3. "New Service" → Conectar repositório Git
4. Adicionar variável DATABASE_URL (Railway fornece automaticamente)
5. Deploy automático!

**Custos Totais:**
- **$5-10/mês (~R$ 25-50/mês)** baseado no uso real
- **Sem sleep do backend**

---

### **Opção 3: Supabase - Grátis (com limitações) ou $25/mês**

**Vantagens:**
- ✅ PostgreSQL gerenciado profissional
- ✅ Backups automáticos (plano pago)
- ✅ Dashboard SQL integrado
- ✅ APIs REST e GraphQL automáticas
- ✅ Autenticação integrada
- ✅ Tier gratuito: 500MB storage + 2GB transferência

**Tier Gratuito (Limitações):**
- ⚠️ Banco pausa após 1 semana inativo (~30s para acordar)
- ⚠️ Sem backups automáticos (precisa fazer manual)
- ✅ Não expira! (pode usar para sempre)

**Plano Pro ($25/mês):**
- ✅ 8GB storage
- ✅ Backups diários automáticos (últimos 7 dias)
- ✅ Point-in-time recovery
- ✅ Nunca pausa

**Como Configurar:**
1. Criar conta em [supabase.com](https://supabase.com)
2. "New Project"
3. Copiar **Connection String** - URI mode
4. Usar como DATABASE_URL no Render/Railway
5. Backend continua no Render, só banco no Supabase

---

### **Opção 4: Backups Manuais Automatizados (Emergencial)**

Se não puder pagar agora, use backups automáticos locais:

**Script de Backup Criado:**
- Arquivo: `backend/scripts/backup-database.js`
- Faz dump completo do PostgreSQL
- Salva em `backend/backups/`
- Mantém últimos 30 backups

**Como Usar:**

```bash
# Fazer backup manual
cd backend
node scripts/backup-database.js

# Restaurar backup
node scripts/backup-database.js restore backups/backup-2026-02-06-14-30-00.sql
```

**Automação com Task Scheduler (Windows):**

1. Abrir "Agendador de Tarefas"
2. "Criar Tarefa Básica"
3. Nome: "Backup APP Valet"
4. Gatilho: Diariamente às 3h da manhã
5. Ação: Iniciar programa
   - Programa: `node.exe`
   - Argumentos: `E:\TRABALHOS\Estacionamento\APP VALLET\backend\scripts\backup-database.js`
   - Iniciar em: `E:\TRABALHOS\Estacionamento\APP VALLET\backend`

**⚠️ ATENÇÃO:** Isso só funciona se seu computador estiver ligado! Não protege se:
- Render deletar banco após 90 dias
- HD queimar
- Computador for roubado

---

## 📊 COMPARAÇÃO DE CUSTOS

**Cotação:** USD 1,00 = R$ 5,00 (aproximado)

| Opção | Custo/Mês (USD) | Custo/Mês (BRL) | Backend Sleep | Banco Permanente | Backups Auto | Recomendação |
|-------|-----------------|-----------------|---------------|------------------|--------------|--------------|
| **Render Free + PostgreSQL Free** | $0 | R$ 0 | ✅ Sim (15min) | ❌ Expira 90 dias | ❌ Não | ⛔ NÃO USE EM PRODUÇÃO |
| **Render Paid PostgreSQL** | $7 | R$ 35 | ✅ Sim (15min) | ✅ Sim | ✅ Sim | ⭐ Bom para começar |
| **Railway** | $5-10 | R$ 25-50 | ❌ Não | ✅ Sim | ✅ Sim | ⭐⭐ Melhor custo-benefício |
| **Supabase Free** | $0 | R$ 0 | ⚠️ Pausa 1 sem | ✅ Sim | ❌ Não | ⚠️ Só para testes |
| **Supabase Pro + Render** | $25-32 | R$ 125-160 | ✅ Sim | ✅ Sim | ✅ Sim | ⭐ Profissional |
| **Backup Manual** | $0 | R$ 0 | ✅ Sim | ⚠️ Depende | ⚠️ Manual | ⚠️ Emergencial apenas |

---

## 🎯 RECOMENDAÇÃO FINAL

### **Para Começar (Baixo Custo):**
**Railway.app - $5-10/mês (~R$ 25-50/mês)**
- Backend sempre online
- PostgreSQL permanente
- Backups automáticos
- Deploy mais fácil

### **Se Já Tiver no Render:**
**Upgrade PostgreSQL - $7/mês (~R$ 35/mês)**
- Só upgradar o banco
- Manter Web Service gratuito
- Configurar backups extras para segurança

### **Profissional (Alta Disponibilidade):**
**Railway ou Render Paid ($14/mês = ~R$ 70/mês)**
- Web Service pago ($7) = sem sleep
- PostgreSQL pago ($7) = backups diários
- Garantia total

---

## 🔧 IMPLEMENTANDO BACKUPS EXTRAS

Mesmo com plano pago, recomendo **backups adicionais**:

### 1. **Backup Local Automático**

Adicionar no `package.json`:

```json
{
  "scripts": {
    "backup": "node scripts/backup-database.js"
  }
}
```

Agendar localmente ou em servidor separado.

### 2. **Backup para Cloud Storage**

Modificar script para enviar para:
- **Google Drive** (gratuito até 15GB)
- **AWS S3** (~$0.023/GB)
- **Dropbox** (2GB grátis)

### 3. **Webhook de Backup Diário**

Criar endpoint no backend:

```javascript
// backend/src/routes/backupRoutes.js
app.post('/api/admin/backup', authenticateAdmin, async (req, res) => {
  try {
    const { createBackup } = await import('../scripts/backup-database.js');
    const filepath = await createBackup();
    res.json({ success: true, filepath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Chamar via cron job ou GitHub Actions.

---

## 📱 DADOS DO APP MOBILE

**AsyncStorage (App):**
- ✅ Apenas cache de autenticação (token, user)
- ✅ Pode ser perdido sem problema (usuário faz login novamente)
- ✅ Não armazena veículos ou entradas

**Todos os dados importantes estão no PostgreSQL!**

---

## 🚨 CHECKLIST DE SEGURANÇA

- [ ] **NÃO usar Render PostgreSQL Free em produção**
- [ ] **Contratar plano pago** (Railway, Render Paid, ou Supabase Pro)
- [ ] **Configurar backups automáticos**
- [ ] **Testar restauração de backup pelo menos 1x**
- [ ] **Salvar backups em 2+ locais diferentes**
- [ ] **Documentar processo de disaster recovery**
- [ ] **Monitorar espaço em disco do banco**
- [ ] **Configurar alertas de falha**

---

## 📞 SUPORTE

Se precisar de ajuda para:
- Migrar para Railway
- Configurar backups automáticos
- Restaurar banco de um backup
- Configurar monitoramento

**Me chame que eu te ajudo! 🚀**

---

## 💡 DICA FINAL

**A pergunta não é "se" você vai perder dados, mas "quando".**

Investir $5-10/mês (~R$ 25-50/mês) em infraestrutura confiável é **infinitamente mais barato** que perder todos os dados dos seus clientes e ter que recadastrar tudo manualmente.

**Isso é menos que:**
- 1 pizza delivery
- 2 cafés no Starbucks
- 1 combo McDonald's

**Recomendação:** Comece com **Railway ($5-10/mês = ~R$ 25-50/mês)** e durma tranquilo. 😴
