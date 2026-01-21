# API Endpoints - APP Valet

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Todos os endpoints (exceto `/auth/*`) requerem header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔐 Autenticação

### 1. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@email.com",
  "password": "senha123",
  "accessKeyCode": "KEY123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "admin",
    "company_id": "uuid",
    "access_key_id": "uuid"
  },
  "company": {
    "id": "uuid",
    "cnpj_cpf": "12.345.678/0001-90",
    "company_name": "Valet Exemplo"
  }
}
```

### 2. Refresh Token
**POST** `/auth/refresh`

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Logout
**POST** `/auth/logout`

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 🚗 Veículos

### 1. Entrada de Veículo
**POST** `/vehicles/entry`

**Request:**
```json
{
  "plate": "ABC-1234",
  "vehicle_type": "sedan",
  "color": "preto",
  "client_name": "João Silva",
  "client_phone": "11987654321",
  "client_email": "joao@email.com",
  "notes": "Observações opcionais"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "plate": "ABC-1234",
  "entry_time": "2026-01-20T14:30:00Z",
  "status": "parked",
  "client_name": "João Silva",
  "client_phone": "11987654321"
}
```

### 2. Saída de Veículo
**POST** `/vehicles/exit/:vehicleId`

**Request:**
```json
{
  "notes": "Observações opcionais"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "plate": "ABC-1234",
  "entry_time": "2026-01-20T14:30:00Z",
  "exit_time": "2026-01-20T16:45:00Z",
  "status": "exited",
  "duration_minutes": 135
}
```

### 3. Listar Veículos Estacionados
**GET** `/vehicles/parked`

**Query Parameters:**
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 20)
- `search` (opcional): buscar por placa

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "plate": "ABC-1234",
      "entry_time": "2026-01-20T14:30:00Z",
      "vehicle_type": "sedan",
      "color": "preto",
      "client_name": "João Silva",
      "duration_minutes": 45
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

### 4. Buscar Veículo por Placa
**GET** `/vehicles/search/:plate`

**Response (200):**
```json
{
  "id": "uuid",
  "plate": "ABC-1234",
  "entry_time": "2026-01-20T14:30:00Z",
  "status": "parked",
  "client_name": "João Silva",
  "duration_minutes": 45
}
```

### 5. Obter Detalhes do Veículo
**GET** `/vehicles/:vehicleId`

**Response (200):**
```json
{
  "id": "uuid",
  "plate": "ABC-1234",
  "vehicle_type": "sedan",
  "color": "preto",
  "entry_time": "2026-01-20T14:30:00Z",
  "exit_time": null,
  "status": "parked",
  "client_name": "João Silva",
  "client_phone": "11987654321",
  "client_email": "joao@email.com",
  "entry_user": {
    "id": "uuid",
    "name": "Operador 1"
  },
  "exit_user": null
}
```

---

## 📊 Relatórios (Admin Only)

### 1. Movimento do Dia
**GET** `/reports/daily-movement`

**Query Parameters:**
- `date` (opcional): formato YYYY-MM-DD (padrão: hoje)

**Response (200):**
```json
{
  "date": "2026-01-20",
  "total_entries": 45,
  "total_exits": 42,
  "currently_parked": 3,
  "unique_vehicles": 45,
  "avg_parking_duration": 128,
  "peak_hour": 12,
  "movements": [
    {
      "id": "uuid",
      "plate": "ABC-1234",
      "movement_type": "entry",
      "time": "2026-01-20T14:30:00Z",
      "user": "João Silva",
      "client_name": "João"
    }
  ]
}
```

### 2. Horários de Pico
**GET** `/reports/peak-hours`

**Query Parameters:**
- `date` (opcional): formato YYYY-MM-DD (padrão: hoje)
- `days` (opcional): últimos N dias (padrão: 7)

**Response (200):**
```json
{
  "period": "last_7_days",
  "peak_hours": [
    {
      "hour": 12,
      "entries": 25,
      "exits": 23,
      "total_movements": 48
    },
    {
      "hour": 13,
      "entries": 22,
      "exits": 24,
      "total_movements": 46
    }
  ],
  "highest_peak_hour": 12,
  "avg_movements_per_hour": 35
}
```

### 3. Relatório de Veículos
**GET** `/reports/vehicles`

**Query Parameters:**
- `start_date` (opcional): formato YYYY-MM-DD
- `end_date` (opcional): formato YYYY-MM-DD

**Response (200):**
```json
{
  "total_vehicles": 150,
  "avg_duration": 145,
  "max_duration": 480,
  "min_duration": 15,
  "vehicles": [
    {
      "id": "uuid",
      "plate": "ABC-1234",
      "entry_time": "2026-01-20T14:30:00Z",
      "exit_time": "2026-01-20T16:45:00Z",
      "duration": 135,
      "client_name": "João Silva"
    }
  ]
}
```

---

## 🖼️ OCR de Placa

### 1. Reconhecer Placa
**POST** `/ocr/recognize-plate`

**Request (multipart/form-data):**
```
image: <arquivo de imagem>
```

**Response (200):**
```json
{
  "plate": "ABC-1234",
  "confidence": 0.98,
  "image_url": "https://...",
  "recognized_at": "2026-01-20T14:30:00Z"
}
```

### 2. Entrada Rápida com Placa
**POST** `/ocr/quick-entry`

**Request:**
```json
{
  "plate": "ABC-1234",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAA...",
  "client_name": "João Silva",
  "client_phone": "11987654321"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "plate": "ABC-1234",
  "entry_time": "2026-01-20T14:30:00Z",
  "status": "parked"
}
```

---

## 📱 SMS

### 1. Histórico de SMS
**GET** `/sms/logs`

**Query Parameters:**
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 20)
- `status` (opcional): 'sent', 'failed', 'pending'

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "phone_number": "11987654321",
      "message": "Seu veículo placa ABC-1234 entrou no valet às 14:30 horas",
      "message_type": "entry",
      "status": "sent",
      "sent_at": "2026-01-20T14:30:01Z"
    }
  ],
  "total": 120,
  "page": 1
}
```

### 2. Reenviar SMS
**POST** `/sms/resend/:smsId`

**Response (200):**
```json
{
  "message": "SMS reenviado com sucesso",
  "status": "sent"
}
```

---

## 👥 Usuários (Admin Only)

### 1. Listar Usuários
**GET** `/users`

**Query Parameters:**
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "admin",
      "status": "active",
      "last_login_at": "2026-01-20T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1
}
```

### 2. Criar Usuário
**POST** `/users`

**Request:**
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "senha123",
  "role": "operator",
  "access_key_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "role": "operator"
}
```

### 3. Atualizar Usuário
**PUT** `/users/:userId`

**Request:**
```json
{
  "name": "Maria Silva",
  "role": "admin",
  "status": "active"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Maria Silva",
  "role": "admin",
  "status": "active"
}
```

### 4. Deletar Usuário
**DELETE** `/users/:userId`

**Response (200):**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

---

## 🔑 Chaves de Acesso (Admin Only)

### 1. Listar Chaves
**GET** `/access-keys`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "key_name": "Celular Principal",
      "key_code": "KEY123ABC",
      "status": "active",
      "created_at": "2026-01-15T00:00:00Z",
      "last_used_at": "2026-01-20T10:00:00Z",
      "active_users": 2
    }
  ]
}
```

### 2. Criar Chave de Acesso
**POST** `/access-keys`

**Request:**
```json
{
  "key_name": "Celular Principal"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "key_name": "Celular Principal",
  "key_code": "KEY123ABC",
  "status": "active"
}
```

### 3. Desativar Chave
**PUT** `/access-keys/:keyId`

**Request:**
```json
{
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "inactive"
}
```

---

## 📋 Checklists de Resposta

### Erros Comuns

| Código | Mensagem | Solução |
|--------|----------|---------|
| 400 | Invalid plate format | Verificar formato da placa |
| 401 | Unauthorized | Verificar token JWT |
| 403 | Forbidden | Verificar permissões (role) |
| 404 | Vehicle not found | Verificar ID do veículo |
| 409 | Vehicle already parked | Veículo já estacionado |
| 500 | Internal server error | Contatar suporte |

---

## Headers Necessários

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
X-Device-ID: <UUID do dispositivo> (opcional, para rastreamento)
```

---

## Rate Limiting

- **Limite**: 100 requisições por minuto por IP
- **Header de resposta**: `X-RateLimit-Remaining`

