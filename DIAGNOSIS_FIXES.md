# Diagnosis - Problemas Identificados e Soluções

## 🔴 PROBLEMA PRINCIPAL

### "Funciona por 3 segundos e depois quebra"

**CAUSA**: Banco de dados PostgreSQL não está rodando em `localhost:5432`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appvalet"
```

Quando você tenta fazer API request, ela tenta conectar ao banco, timeout, e volta erro.

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Backend - Tratamento Robusto de Erros

**Arquivo**: `backend/src/controllers/accessKeyController.js`

- Adicionado tratamento de erro para logs de validação falhada
- Log com `accessKeyId: null` em vez de 'unknown' para evitar constraint violations
- Erro handling melhorado com try-catch em operações críticas
- Resposta ainda retorna sucesso mesmo se log falhar

### 2. Backend - Melhor Logging e Diagnostics

**Arquivo**: `backend/src/lib/prisma.js`

- Adicionado event listeners para erros do Prisma
- Graceful shutdown para evitar conexões abruptas
- Pretty error formatting
- Melhor tratamento de sinais (SIGINT, SIGTERM)

### 3. Setup Local com Docker

Criado:
- `docker-compose.yml` - PostgreSQL + Backend
- `backend/Dockerfile` - Containerização do backend
- `SETUP_LOCAL_DOCKER.md` - Guia de início rápido

---

## 🚀 PRÓXIMOS PASSOS

### Para Testar Localmente

```bash
# Opção 1: Com Docker (mais fácil)
docker-compose up -d
docker exec valet-app-backend npx prisma migrate dev
npm start

# Opção 2: PostgreSQL Local
# Instale PostgreSQL 15, crie database 'appvalet'
cd backend
npm start
```

### Para Produção (Railway)

✅ Está tudo OK em prod! Railway tem:
- PostgreSQL gerenciado
- DATABASE_URL correto
- Backend 24h online

---

## ⚠️ PROBLEMA SECUNDÁRIO

### "Chave não é herdada na próxima tela"

**POSSÍVEL CAUSA**: Frontend não está propagando corretamente entre contextos

**Checklist**:
- [ ] AccessKeyContext está salvando em AsyncStorage?
- [ ] LoginScreen está lendo corretamente?
- [ ] Há delay entre telas?

**Verificar**:

```javascript
// frontend/src/store/AccessKeyContext.js - linha ~124-135
setAccessKey(key); // Está sendo chamado?

// frontend/src/screens/LoginScreen.js - linha ~20-24
useEffect(() => {
  if (accessKey) {
    setAccessKeyCode(accessKey); // Está recebendo?
  }
}, [accessKey]);
```

---

## 📋 RESUMO DAS MUDANÇAS

| Arquivo | Mudança | Propósito |
|---------|---------|----------|
| `backend/src/controllers/accessKeyController.js` | Melhor error handling | Evita crashes silenciosos |
| `backend/src/lib/prisma.js` | Event listeners + shutdown | Mais robusto |
| `docker-compose.yml` | NOVO | Setup local fácil |
| `backend/Dockerfile` | NOVO | Containerização |
| `SETUP_LOCAL_DOCKER.md` | NOVO | Documentação |

---

## 🧪 TESTES RECOMENDADOS

```bash
# 1. Verificar saúde do backend
curl http://localhost:3000/health

# 2. Validar chave (sem banco, deve falhar gracefully)
curl -X POST http://localhost:3000/api/access-keys/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"VALET-TEST"}'

# 3. Com banco rodando
npm run seed  # Gera dados de teste
curl -X POST http://localhost:3000/api/access-keys/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"<generated-key>"}'
```
