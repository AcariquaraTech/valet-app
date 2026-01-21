# Schema do Banco de Dados - APP Valet

## Tabelas Principais

### 1. `companies` (Empresas/Clientes)
Armazena os dados das empresas que usam o sistema.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj_cpf VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  license_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  license_expiry_date TIMESTAMP,
  max_access_keys INTEGER DEFAULT 1,
  billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `access_keys` (Chaves de Acesso)
Cada chave permite múltiplos logins em diferentes dispositivos.

```sql
CREATE TABLE access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  key_name VARCHAR(255) NOT NULL,
  key_code VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

### 3. `users` (Usuários)
Usuários do sistema com roles diferentes.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  access_key_id UUID NOT NULL REFERENCES access_keys(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') DEFAULT 'operator',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  UNIQUE(email, company_id)
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_access_key_id ON users(access_key_id);
```

### 4. `vehicles` (Veículos)
Registro de veículos estacionados.

```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  plate VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(50),
  color VARCHAR(50),
  client_name VARCHAR(255),
  client_phone VARCHAR(20),
  client_email VARCHAR(255),
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP,
  entry_user_id UUID REFERENCES users(id),
  exit_user_id UUID REFERENCES users(id),
  status ENUM('parked', 'exited') DEFAULT 'parked',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_entry_time ON vehicles(entry_time);
```

### 5. `movements` (Movimentos do Dia)
Histórico de movimentos para relatórios.

```sql
CREATE TABLE movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  vehicle_id UUID REFERENCES vehicles(id),
  user_id UUID REFERENCES users(id),
  movement_type ENUM('entry', 'exit') NOT NULL,
  plate VARCHAR(20) NOT NULL,
  movement_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  client_name VARCHAR(255),
  client_phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_movements_company_id ON movements(company_id);
CREATE INDEX idx_movements_movement_time ON movements(movement_time);
CREATE INDEX idx_movements_movement_type ON movements(movement_type);
```

### 6. `sms_logs` (Log de SMS)
Registro de todas as mensagens SMS enviadas.

```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  vehicle_id UUID REFERENCES vehicles(id),
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('entry', 'exit', 'notification') DEFAULT 'notification',
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  external_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_sms_logs_company_id ON sms_logs(company_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
```

### 7. `plate_recognitions` (Histórico OCR)
Registro de reconhecimentos de placa via câmera.

```sql
CREATE TABLE plate_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  plate_detected VARCHAR(20),
  confidence_score DECIMAL(3,2),
  image_url TEXT,
  recognized_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_plate_recognitions_company_id ON plate_recognitions(company_id);
```

### 8. `licenses` (Licenças)
Informações de licenças das empresas.

```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id),
  license_key VARCHAR(255) UNIQUE NOT NULL,
  start_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  max_users INTEGER DEFAULT 5,
  max_daily_vehicles INTEGER,
  status ENUM('active', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
  payment_status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
  renewal_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_licenses_company_id ON licenses(company_id);
CREATE INDEX idx_licenses_expiry_date ON licenses(expiry_date);
```

## Views (Para Relatórios)

### Daily Summary
```sql
CREATE VIEW v_daily_summary AS
SELECT
  c.id as company_id,
  c.company_name,
  CAST(m.movement_time AS DATE) as date,
  COUNT(CASE WHEN m.movement_type = 'entry' THEN 1 END) as total_entries,
  COUNT(CASE WHEN m.movement_type = 'exit' THEN 1 END) as total_exits,
  COUNT(DISTINCT m.plate) as unique_vehicles,
  AVG(CASE WHEN m.duration_minutes > 0 THEN m.duration_minutes END) as avg_parking_duration
FROM movements m
JOIN companies c ON m.company_id = c.id
GROUP BY c.id, c.company_name, CAST(m.movement_time AS DATE);
```

### Peak Hours
```sql
CREATE VIEW v_peak_hours AS
SELECT
  c.id as company_id,
  c.company_name,
  EXTRACT(HOUR FROM m.movement_time)::INT as hour,
  COUNT(*) as total_movements,
  COUNT(CASE WHEN m.movement_type = 'entry' THEN 1 END) as entries,
  COUNT(CASE WHEN m.movement_type = 'exit' THEN 1 END) as exits
FROM movements m
JOIN companies c ON m.company_id = c.id
GROUP BY c.id, c.company_name, EXTRACT(HOUR FROM m.movement_time)
ORDER BY total_movements DESC;
```

## Relacionamentos

```
companies (1) ──────→ (N) access_keys
    ↓
    ├─→ (N) users
    ├─→ (N) vehicles
    ├─→ (N) movements
    ├─→ (N) sms_logs
    ├─→ (N) plate_recognitions
    └─→ (1) licenses

access_keys (1) ──────→ (N) users

users (1) ──────→ (N) movements

vehicles (1) ──────→ (N) movements
```

## Índices Principais

```sql
-- Autenticação
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_access ON users(company_id, access_key_id);

-- Veículos
CREATE INDEX idx_vehicles_plate_company ON vehicles(plate, company_id);
CREATE INDEX idx_vehicles_date_range ON vehicles(entry_time, exit_time);

-- Movimentos
CREATE INDEX idx_movements_date_company ON movements(movement_time, company_id);

-- SMS
CREATE INDEX idx_sms_logs_date ON sms_logs(created_at);
```

## Enums

- **company_license_status**: 'active', 'inactive', 'suspended'
- **access_key_status**: 'active', 'inactive'
- **user_role**: 'admin', 'operator'
- **user_status**: 'active', 'inactive'
- **vehicle_status**: 'parked', 'exited'
- **movement_type**: 'entry', 'exit'
- **sms_status**: 'sent', 'failed', 'pending'
- **license_status**: 'active', 'expired', 'suspended', 'cancelled'
- **payment_status**: 'paid', 'pending', 'overdue'

## Triggers

### Atualizar updated_at automaticamente
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
