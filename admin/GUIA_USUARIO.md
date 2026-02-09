# 📊 Admin Panel Web - Guia de Uso

## 🎯 O que foi criado

Uma interface web completa para que o administrador do estacionamento possa gerenciar e visualizar todos os dados do sistema através do notebook, sem necessidade de aplicativo mobile.

## 🚀 Como Acessar

1. **URL de Acesso**: `http://localhost:5174` (em desenvolvimento)
   - Em produção será: `https://seu-dominio.com/admin`

2. **Login**:
   - **Usuário**: `admin` (ou seu nickname configurado)
   - **Senha**: Sua senha cadastrada
   - **Chave de Acesso**: Será usado automaticamente do backend

## 📋 Funcionalidades

### 1️⃣ **Gerenciar** (Aba Principal)
Gerenciar clientes, chaves de acesso e usuários do sistema:
- ✅ Criar e editar clientes
- ✅ Gerenciar chaves de acesso
- ✅ Ativar/desativar chaves
- ✅ Vincular usuários

### 2️⃣ **Relatórios** (Nova Aba)
Visualizar análises detalhadas do movimento:

#### 📥 **Movimento Diário**
- Selecione uma data específica
- Veja: Entradas, Saídas, Veículos únicos, Pico de horário
- Ideal para análise diária

#### 📈 **Picos de Horário**
- Selecione um período (início e fim)
- Grupos rápidos: Últimos 7 dias, 30 dias
- Agrupe por hora ou dia
- Veja distribuição de movimento ao longo do tempo

#### 🚗 **Veículos**
- Visualize todos os veículos que passaram
- Busque por placa específica
- Veja: Entradas, Saídas, Tempo total, Tempo médio

## 📱 Interface Mobile

Os dados são **responsivos** e funcionam em:
- 💻 Desktop (melhor experiência)
- 📱 Tablet
- 📲 Smartphone (verá menu comprimido)

## 🔑 Dicas de Uso

### Para Análise Diária
1. Clique em **Relatórios**
2. Selecione a data desejada em **Movimento Diário**
3. Veja resumo em cards coloridos
4. Consulte a tabela com detalhes

### Para Análise de Períodos
1. Clique em **Relatórios**
2. Abra a aba **Picos de Horário**
3. Use os botões rápidos ou selecione datas customizadas
4. Escolha agrupar por hora ou dia
5. Analise a distribuição de movimento

### Para Análise de Veículos
1. Clique em **Relatórios**
2. Abra a aba **Veículos**
3. Use a barra de busca para filtrar por placa
4. Veja número de visitas e tempo gasto

## 🎨 Design

- **Cores**: Gradiente azul/roxo para dados principais
- **Cards**: Resumos visuais dos dados
- **Tabelas**: Dados detalhados em formato tabular
- **Responsivo**: Adapta-se a qualquer tamanho de tela

## 🔐 Segurança

- Login com JWT (token seguro)
- Sessão armazenada localmente
- Botão "Sair" para desconectar
- Relatórios com dados filtrados do backend

## 📞 Suporte

Qualquer dúvida, abra o console do navegador (F12) para ver mensagens de erro detalhadas.

---

**Desenvolvido com React + Vite + Tailwind CSS**
