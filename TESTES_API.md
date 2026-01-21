# Testes de API - APP VALET

Copie e cole os comandos abaixo no PowerShell para testar a API.

## 1. Teste Básico - Listar Veículos (sem token)

```powershell
curl.exe -X GET http://localhost:3000/api/vehicles `
  -H "Content-Type: application/json"
```

**Resposta esperada (erro porque sem token):**
```json
{"error":"Token não fornecido","code":"MISSING_TOKEN"}
```

---

## 2. Teste Login - Para conseguir token

```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "operador@test.com",
    "password": "123456"
  }'
```

**Nota**: Como o banco ainda não está conectado, isso pode retornar erro de banco.

---

## 3. Teste OCR - Reconhecer Placa

```powershell
curl.exe -X POST http://localhost:3000/api/ocr/recognize-plate `
  -H "Content-Type: application/json" `
  -d '{
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Resposta esperada (mock):**
```json
{"success":true,"plate":"ABC-1234","confidence":0.95,"rawText":"Detected plate from image"}
```

---

## 4. Teste SMS - Enviar notificação

```powershell
curl.exe -X POST http://localhost:3000/api/sms/send `
  -H "Content-Type: application/json" `
  -d '{
    "to": "11987654321",
    "message": "Seu veículo entrou no estacionamento"
  }'
```

**Resposta esperada (mock):**
```json
{"success":true,"sid":"SM_MOCK_XXXXX","status":"queued"}
```

---

## 5. Verificar Status do Servidor

```powershell
curl.exe http://localhost:3000
```

**Resposta esperada:**
```json
{"message":"APP VALET - Backend Running","port":3000,"environment":"development"}
```

---

## 📝 Próximos Passos

1. **Instalar PostgreSQL** (https://www.postgresql.org/download/)

2. **Conectar no `.env`:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/app_valet
   ```

3. **Instalar Prisma:**
   ```powershell
   cd backend
   npm install @prisma/client prisma
   npx prisma init
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Testar com dados reais**

---

## 🎯 Documentação Completa

- [API.md](./docs/API.md) - Todos os 20+ endpoints
- [QUICK_START.md](./QUICK_START.md) - Como iniciar
- [RESUMO_TECNICO_FINAL.md](./RESUMO_TECNICO_FINAL.md) - Status técnico

