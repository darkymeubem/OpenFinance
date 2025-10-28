# 🚀 Deploy no Render - Guia Completo

## 📋 Pré-requisitos

1. ✅ Conta no GitHub (gratuita)
2. ✅ Conta no Render (gratuita) - https://render.com
3. ✅ Projeto do Supabase configurado

---

## 🎯 Passo a Passo

### 1️⃣ Enviar Código para o GitHub

```bash
# Se ainda não inicializou o git
git init
git add .
git commit -m "Initial commit - OpenFinance API"

# Crie um repositório no GitHub (https://github.com/new)
# Depois conecte e faça push:
git remote add origin https://github.com/SEU-USUARIO/OpenFinance.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Deploy no Render

1. **Acesse:** https://render.com
2. **Faça login** (pode usar conta do GitHub)
3. **Clique em:** "New" → "Web Service"
4. **Conecte seu repositório do GitHub**
5. **Configure:**

```
Name: openfinance-api
Region: Ohio (US East) ou mais próximo
Branch: main
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

6. **Selecione o plano:** Free

---

### 3️⃣ Configurar Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui
PORT=3000
NODE_ENV=production
```

⚠️ **IMPORTANTE:** Use as mesmas credenciais do seu `.env` local!

---

### 4️⃣ Deploy Automático

Clique em **"Create Web Service"**

O Render vai:
- ✅ Clonar seu repositório
- ✅ Instalar dependências
- ✅ Compilar TypeScript
- ✅ Iniciar o servidor
- ✅ Gerar uma URL pública

⏱️ Tempo: ~3-5 minutos

---

### 5️⃣ Sua URL Estará Pronta!

```
https://openfinance-api.onrender.com
```

**Endpoints disponíveis:**
```
GET  https://openfinance-api.onrender.com/
GET  https://openfinance-api.onrender.com/api/test
GET  https://openfinance-api.onrender.com/api/test-supabase
POST https://openfinance-api.onrender.com/api/transaction
GET  https://openfinance-api.onrender.com/api/transactions
```

---

## 📱 Configurar no iPhone

### No seu Shortcut do iPhone, use:

```
URL: https://openfinance-api.onrender.com/api/transaction
Method: POST
Headers: Content-Type: application/json
Body: {
  "description": "Compra X",
  "amount": -50.00,
  "is_credit_card": true,
  "category": "Alimentação"
}
```

---

## 🧪 Testar o Deploy

```bash
# Testar se está online
curl https://openfinance-api.onrender.com/

# Testar conexão com Supabase
curl https://openfinance-api.onrender.com/api/test-supabase

# Criar transação
curl -X POST https://openfinance-api.onrender.com/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"description":"Teste Deploy","amount":-25.50,"is_credit_card":true}'
```

---

## 🔄 Atualizações Futuras

**Depois do primeiro deploy, é automático!**

```bash
# Faça suas mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push

# O Render detecta automaticamente e faz redeploy! 🎉
```

---

## ⚠️ Limitações do Plano Gratuito

- ✅ 750 horas/mês (suficiente para testes)
- ⚠️ Servidor "dorme" após 15 min sem uso
- ⚠️ Primeira requisição após "acordar" demora ~30 segundos
- ✅ HTTPS (SSL) incluso
- ✅ Deploy automático do GitHub

**Dica:** Se a primeira requisição demorar, é normal! O servidor estava dormindo.

---

## 🎯 Alternativa: Railway (Mais Rápido)

Se preferir, o Railway é ainda mais rápido:

1. Acesse: https://railway.app
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. Selecione o repositório
5. Adicione variáveis de ambiente
6. Deploy automático!

**Diferença:** Railway dá $5/mês de crédito grátis e não dorme.

---

## ✅ Checklist Final

- [ ] Código no GitHub
- [ ] Deploy no Render configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] URL pública funcionando
- [ ] Teste com cURL bem-sucedido
- [ ] iPhone configurado com a nova URL

---

## 🆘 Troubleshooting

### Erro de build:
- Verifique se o `package.json` tem os scripts `build` e `start`
- Verifique se todas as dependências estão listadas

### Erro ao iniciar:
- Verifique as variáveis de ambiente no Render
- Veja os logs em "Logs" no painel do Render

### Erro de conexão com Supabase:
- Verifique se as credenciais estão corretas
- Teste a URL: `/api/test-supabase`

---

## 🎉 Pronto!

Agora você tem uma API pública que funciona de qualquer lugar! 🌍

**Bônus:** A cada push no GitHub, o Render faz deploy automático! 🚀

