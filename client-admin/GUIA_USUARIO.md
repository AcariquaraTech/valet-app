# 📊 Portal Web Cliente - Guia de Uso

## 🎯 O que é

Portal web dedicado para que o cliente administrador do estacionamento visualize todo o movimento e análises através do seu notebook.

## 🚀 Como Acessar

1. **URL de Acesso Local**: `http://localhost:5174` (em desenvolvimento)
2. **URL de Produção**: Será fornecida após deploy

### Login
- **Usuário**: Seu nickname cadastrado no sistema
- **Senha**: Sua senha segura
- Ambos são gerenciados pela chave de acesso associada

## 📊 Funcionalidades Principais

### 1. **Movimento Diário** 📅
Visualize o movimento de um dia específico:
- 📥 **Entradas**: Quantos veículos entraram
- 📤 **Saídas**: Quantos veículos saíram
- 🚗 **Veículos Únicos**: Quantidade de carro diferentes
- ⏰ **Pico de Horário**: Qual hora teve mais movimento
- **Tabela Detalhada** com todas as métricas

**Como usar:**
1. Selecione a data no campo "Data"
2. Visualize os resumos em cards coloridos
3. Consulte a tabela para mais detalhes

---

### 2. **Picos de Horário** 📈
Analise o movimento distribuído por horas ou dias:
- Selecione período (data inicial e final)
- Escolha agrupar por **Hora** ou **Dia**
- Veja a distribuição mostrando entradas e saídas

**Botões Rápidos:**
- "Últimos 7 dias" - Análise semanal
- "Últimos 30 dias" - Análise mensal

**Como usar:**
1. Use os campos de data OU os botões rápidos
2. Selecione "Hora" para ver picos de movimento por hora
3. Selecione "Dia" para ver movimento por dia
4. Tabela mostra: Período | Entradas | Saídas | Saldo

---

### 3. **Veículos** 🚗
Visualize todos os veículos que estacionaram:
- 🚗 **Total de Veículos**: Quantidade de carros diferentes
- 📥 **Total de Entradas**: Soma de todas as entradas
- 📊 **Média de Visitas**: Quantas vezes cada carro, em média, entrou

**Busca:**
- Digite a placa para filtrar um veículo específico
- Exemplo: "ABC-1234" ou apenas "ABC"

**Tabela de Veículos:**
| Coluna | O que significa |
|--------|---|
| Placa | Identificação do veículo |
| Entradas | Quantas vezes entrou |
| Saídas | Quantas vezes saiu |
| Tempo Total | Horas totais estacionado |
| Tempo Médio | Média de horas por visita |

**Como usar:**
1. Selecione período de análise
2. (Opcional) Busque por placa específica
3. Consulte a tabela completa

---

## 🎨 Design e Responsividade

- ✅ **Desktop**: Melhor experiência de visualização
- ✅ **Tablet**: Adapta-se a telas maiores
- ✅ **Smartphone**: Menu comprimido, tabelas deslizáveis

## 🔐 Segurança

✅ Login seguro com autenticação JWT
✅ Token armazenado localmente
✅ Comunicação criptografada (HTTPS em produção)
✅ Sessão isolada por usuário

Clique em **"Sair"** para desconectar com segurança.

---

## 💡 Dicas Práticas

**Para análise de picos:**
- Use "Últimos 7 dias" para planejar escalas
- Use "Últimos 30 dias" para relatórios mensais
- Agrupe por "Hora" para otimizar horários de operação

**Para gestão de estacionamento:**
- Monitore veículos recorrentes
- Acompanhe dias com maior movimento
- Identifique horários de pico para alocação de pessoal

---

## ❓ Perguntas Frequentes

**P: Como exporTo dados?**
R: Use Print do navegador (Ctrl+P) para gerar PDF

**P: Os dados são atualizados em tempo real?**
R: Sim, ao mudar a data ou filtro, os dados são recarregados

**P: Quanto tempo de dados históricos tenho acesso?**
R: Acesso completo a todo histórico cadastrado no sistema

**P: Posso acessar por celular?**
R: Sim, mas desktop oferece melhor experiência

---

## 📞 Suporte

Para dúvidas técnicas ou problemas:
1. Verifique sua conexão com internet
2. Limpe cache do navegador (Ctrl+Shift+Delete)
3. Tente fazer login novamente
4. Contate o administrador de TI

---

**Desenvolvido com ❤️ para seu negócio**
