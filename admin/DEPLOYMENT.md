# 🚀 Deploy da Interface Web Admin para Produção

## Opção 1: Deploy na Vercel (Recomendado - Grátis)

### Passo 1: Preparar Git
```bash
cd admin
git add .
git commit -m "feat: add web admin interface with reports"
git push origin main
```

### Passo 2: Criar conta na Vercel
1. Acesse https://vercel.com
2. Login com GitHub
3. Clique em "New Project"
4. Selecione seu repositório
5. Configure as variáveis de ambiente

### Passo 3: Configurar Variáveis de Ambiente
Adicione na Vercel:
```
VITE_API_URL=https://valet-app-production.up.railway.app/api
```

### Passo 4: Deploy
Vercel automaticamente vai:
- Fazer build do projeto
- Servir na URL: `seu-projeto.vercel.app`

---

## Opção 2: Deploy no Railway (Mesmo lugar do backend)

### Passo 1: Criar novo serviço no Railway
1. Vá para https://railway.app
2. Clique em "+ New Service"
3. Selecione "GitHub Repo"
4. Selecione seu repositório

### Passo 2: Configurar Build
Em Settings:
- **Root Directory**: `admin`
- **Build Command**: `npm run build`
- **Start Command**: `npx serve -s dist -l 5173`

### Passo 3: Variáveis de Ambiente
```
VITE_API_URL=https://valet-app-production.up.railway.app/api
```

### Passo 4: Deploy
- Railway automaticamente faz deploy a cada push

A URL será algo como: `seu-app-production.up.railway.app`

---

## Opção 3: Deploy no seu próprio servidor

### Passo 1: Build local
```bash
cd admin
npm run build
```

Isso cria a pasta `dist/` com todos os arquivos estáticos.

### Passo 2: Upload para servidor
Via FTP/SSH, copie a pasta `dist/` para seu servidor web (Apache, Nginx, etc).

### Passo 3: Configurar servidor web
Para **Nginx**:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Para **Apache**:
Crie arquivo `.htaccess` em `dist/`:
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

---

## 📝 Checklist Final

- [ ] Backend rodando em Railway (ou seu servidor)
- [ ] URLs de API atualizadas em `admin/src/services/api.js`
- [ ] Variáveis de ambiente configuradas
- [ ] Login testado e funcionando
- [ ] Relatórios carregando dados corretamente
- [ ] HTTPS/SSL configurado (importante para produção)
- [ ] Domínio DNS configurado para apontar para admin

---

## 🔒 Segurança em Produção

1. **HTTPS obrigatório**
2. **CORS configurado** no backend para aceitar apenas seu domínio
3. **Headers de segurança**:
   ```
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Strict-Transport-Security: max-age=31536000
   ```
4. **Rate limiting** no backend para login

---

## 🐛 Troubleshooting

**Erro "Cannot find module"**:
```bash
cd admin
npm install
```

**Porta 5173 em uso**:
```bash
npm run dev -- --port 5174
```

**API não conecta**:
- Verifique se `admin/src/services/api.js` tem URL correta
- Verifique CORS no backend

---

Qualquer dúvida, consulte a documentação original do projeto! 🚀
