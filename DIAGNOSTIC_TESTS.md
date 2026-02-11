# 🧪 DIAGNOSTICO PASSO A PASSO

## ⚠️ IMPORTANTE: Seu problema "funciona 3 segundos e quebra"

Preciso que você execute estes testes**em ordem** para identificarmos exatamente onde está o problema.

---

## 📋 PASSO 1: Verifique se PostgreSQL está rodando

### Windows - Ver processos PostgreSQL:
```powershell
Get-Process | Where-Object {$_.Name -like "*postgres*"}
```

Se não houver resultado, PostgreSQL NÃO está rodando.

### Se tiver PostgreSQL instalado localmente:
```powershell
# Para iniciar (se tiver instalado como serviço)
Start-Service "postgresql-x64-15"

# Ou procure o executável
netstat -ano | findstr :5432
```

---

## 📋 PASSO 2: Teste com Docker

Se não tem PostgreSQL, use Docker:

```bash
cd "e:\TRABALHOS\Estacionamento\APP VALLET"

# Verifique se Docker está rodando
docker ps

# Suba apenas PostgreSQL
docker-compose up -d postgres

# Aguarde 10s (postgres inicializar)
Start-Sleep -Seconds 10

# Verifique se está rodando
docker ps
```

---

## 📋 PASSO 3: Suba o Backend com LOGS VERBOSOS

```bash
cd backend

# Limpe logs antigos
Remove-Item -Path "*-error.log" -ErrorAction SilentlyContinue

# Inicie com modo debug
$env:DEBUG="*"; npm start

# Você deve ver isso:
# [APP.JS] Registrando rotas...
# Servidor começando...
# Se conectar no banco: "Prisma connected"
```

---

## 📋 PASSO 4: Teste Endpoint /health (em OUTRO terminal)

```powershell
# Terminal NOVO (enquanto backend está rodando)
cd "e:\TRABALHOS\Estacionamento\APP VALLET"

# Test 1: health básico
curl http://localhost:3000/health

# Se tiver sucesso (200), continue:
curl http://localhost:3000/api/health
```

---

## 📋 PASSO 5: Teste validação de chave

```powershell
# Terminal NOVO

$body = @{
  code = "VALET-TEST"
  deviceId = "test"
  appVersion = "1.0"
  osVersion = "ios"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/access-keys/validate" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing
```

---

## 📋 PASSO 6: Teste requisições contínuas (O que testa o "crash de 3s")

```powershell
# Terminal NOVO
# Este script faz 10 requisições com 1s de intervalo
# Se crash em 3s, vai falhar aqui

$url = "http://localhost:3000/api/health"

for($i = 1; $i -le 10; $i++) {
  Write-Host "Request $i..."
  try {
    $start = Get-Date
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
    $elapsed = ((Get-Date) - $start).TotalMilliseconds
    Write-Host "  ✓ Sucesso em ${elapsed}ms" -ForegroundColor Green
  } catch {
    Write-Host "  ✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
  }
  Start-Sleep -Milliseconds 1000
}
```

---

## 🎯 QUANDO VOCÊ EXECUTAR ISSO, ME ENVIE:

1. **Saída completa do backend** (com logs)
2. **Resultado de cada teste** acima
3. **Qual teste falha?** Em qual linha?
4. **Mensagem exata do erro**

---

## 🔍 HIPÓTESES E TESTES

### Se falhar em "conexão com banco":
```
Connection refused / Can't reach database server at localhost:5432
```
→ Solução: Suba PostgreSQL (via Docker ou local)

### Se falhar após 3s:
```
ECONNREFUSED ou ETIMEDOUT após 3s
```
→ Solução: Pode ser pool limit ou timeout no Prisma

### Se falhar aleatoriamente:
```
Connection pooling issue / Too many connections
```
→ Solução: Aumentar pool size no Prisma

### Se responder 200 mas dados vazios:
```
success: false, "Chave inválida"
```
→ Normal! Só teste com chave válida (pós-seed)

---

## 💾 SEED - Adicione dados de teste

Uma que banco tiver rodando:

```bash
cd backend
npx prisma seed

# Ou gere a chave manualmente:
npm run generate-test-key
```

---

## ⏱️ TEMPO ESTIMADO

- Passo 1-2: 2 minutos
- Passo 3: 1 minuto  
- Passo 4-6: 5 minutos
- **Total: ~10 minutos**

---

## 📞 PRÓXIMOS PASSOS

Assim que executar esses testes e enviar os resultados, poderei:
1. Identificar EXATAMENTE o ponto de falha
2. Corrigir o código específico
3. Testar localmente
4. Fazer deploy

**Faça agora e me envie os logs! 🚀**
