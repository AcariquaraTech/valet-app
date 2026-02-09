# 🚀 Deploy do Portal Web Cliente

## Opção 1: Deploy na Vercel (Recomendado - Grátis)

### Passo 1: Preparar Git
```bash
cd client-admin
git add .
git commit -m "feat: add client admin portal with reports"
git push origin main
```

### Passo 2: Criar conta na Vercel
1. Acesse https://vercel.com
2. Login com GitHub
3. Clique em "New Project"
4. Selecione seu repositório

### Passo 3: Configurar Projeto
Na tela de configuração:
- **Framework**: Vite
- **Root Directory**: `client-admin`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Passo 4: Variáveis de Ambiente
Adicione em "Environment Variables":
```
VITE_API_URL=https://valet-app-production.up.railway.app/api
```

### Passo 5: Deploy
Clique em "Deploy" e aguarde. Vercel criará URL automática como:
```
seu-projeto.vercel.app
```

---

## Opção 2: Deploy no Railway (Mesmo lugar do backend)

### Passo 1: Criar novo serviço
1. Vá para https://railway.app
2. Selecione seu projeto Valet
3. Clique em "+ New Service"
4. Escolha "GitHub Repo"

### Passo 2: Configurar Build
Em Settings do novo service:
```
Root Directory: client-admin
Build Command: npm run build
Start Command: npx serve -s dist -l 5173
```

### Passo 3: Variáveis de Ambiente
```
VITE_API_URL=https://valet-app-production.up.railway.app/api
```

### Passo 4: Deploy
Railway faz deploy automático a cada push.

URL final: `seu-app-client.up.railway.app`

---

## Opção 3: Deploy em Servidor Próprio

### Passo 1: Build Local
```bash
cd client-admin
npm run build
```

Gera pasta `dist/` com arquivos prontos para servir.

### Passo 2: Upload para Servidor
Via FTP/SFTP, copie toda pasta `dist/` para seu servidor:
```
/var/www/client-admin/dist/
```

### Passo 3: Configurar Servidor Web

#### Para Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /var/www/client-admin/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # HTTPS recomendado
    listen 443 ssl;
    ssl_certificate /etc/ssl/seu-certificado.crt;
    ssl_certificate_key /etc/ssl/sua-chave.key;
}
```

#### Para Apache:
Crie `.htaccess` em `dist/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Ative mod_rewrite:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## 🔒 Segurança em Produção

### 1. HTTPS Obrigatório
```nginx
# Redirecione HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Headers de Segurança
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 3. CORS no Backend
No `backend/src/app.js`, configure CORS:
```javascript
const corsOptions = {
    origin: ['https://seu-dominio-cliente.com', 'https://seu-dominio-admin.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

### 4. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas máximo
    message: 'Muitas tentativas de login, tente mais tarde'
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

---

## 🔧 Troubleshooting

### Erro: "Cannot find module"
```bash
cd client-admin
npm install
```

### Porta já está em uso
```bash
npm run dev -- --port 5174
```

### API não conecta
- Verifique URL em `client-admin/src/services/api.js`
- Confirme que backend está rodando
- Verifique CORS no backend
- Abra console do navegador (F12) para ver erros

### Build muito grande
Otimize em `vite.config.js`:
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'axios']
        }
      }
    }
  }
}
```

---

## 📊 Performance

### Antes do Deploy, teste:
```bash
npm run build
npm run preview
```

Acesse `localhost:5173` e simule uso real.

### Métricas a Verificar:
- Tempo de carregamento inicial (< 3s)
- Tempo de busca de relatórios (< 2s)
- Responsividade em mobile

---

## 📝 Ambiente de Desenvolvimento

```bash
cd client-admin
npm install
npm run dev
```

Acessa em `http://localhost:5174`

---

## ✅ Checklist Final de Deploy

- [ ] Código testado localmente
- [ ] Git repositório atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS/SSL ativo em produção
- [ ] CORS permitindo cliente
- [ ] Backend rodando e acessível
- [ ] Domínio DNS configurado
- [ ] Email/notificações para admin funcionando
- [ ] Teste de login realizado
- [ ] Teste de relatórios funcionando

---

**Desenvolvido com ❤️ para seu negócio**
