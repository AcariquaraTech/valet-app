# Início Rápido com Docker

## Pré-requisitos
- Docker & Docker Compose instalados

## Como Rodar

### Opção 1: Com Docker Compose (Recomendado)

```bash
# Subir postgres + um backend automaticamente
docker-compose up -d

# Aplicar migrações do Prisma
docker exec valet-app-backend npx prisma migrate dev

# Seed (dados iniciais)
docker exec valet-app-backend npm run seed

# Verificar logs
docker compose logs -f backend
```

### Opção 2: Rodar Backend Localmente com PostgreSQL no Docker

```bash
# Subir apenas o PostreSQL
docker-compose up -d postgres

# No terminal do backend, rodar:
cd backend
npm install
npx prisma migrate dev
npm run seed
npm start
```

### Opção 3: Sem Docker (PostgreSQL Local)

Certifique-se que PostgreSQL 15+ está rodando em `localhost:5432` com:
- Usuário: `postgres`
- Senha: `postgres`
- Database: `appvalet`

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm start
```

## Parar os Serviços

```bash
docker-compose down
# Para remover volumes (dados):
docker-compose down -v
```

## Problemas Comuns

### "Can't reach database server"
- Verifique se Docker está rodando
- Ou se PostgreSQL local está na porta 5432

### Porta 5432 já em uso
```bash
# Verificar qual processo está usando
lsof -i :5432

# Ou mudar no docker-compose.yml:
ports:
  - "5433:5432"  # host:container
```

## Teste a Rota

```bash
curl -X POST http://localhost:3000/api/health \
  -H "Content-Type: application/json"
```

## Frontend

Certifique que o frontend está apontando para a URL correta:
- **Desenvolvimento Local**: `http://localhost:3000`
- **Produção Railway**: `https://valet-app-production.up.railway.app`

Edite `frontend/src/store/AccessKeyContext.js` linha ~9 para ajustar a URL do backend.
