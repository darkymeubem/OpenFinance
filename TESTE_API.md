# 🧪 Guia de Testes - OpenFinance API com Supabase

## ✅ Checklist de Setup

Antes de testar, certifique-se que:

1. ✅ Executou o `supabase-schema.sql` no Supabase
2. ✅ Configurou o arquivo `.env` com suas credenciais
3. ✅ Instalou as dependências: `npm install`

---

## 🚀 Iniciar o Servidor

```bash
npm run dev
```

Você deve ver:
```
✅ Supabase inicializado com sucesso!
🚀 Servidor rodando na porta 3000
📊 OpenFinance API - Sistema de Automação Financeira
🌍 Ambiente: development
🔗 Teste: http://localhost:3000
📱 Endpoint para iPhone: http://localhost:3000/api/transaction
```

---

## 🧪 Testes com cURL

### 1️⃣ Testar se a API está online
```bash
curl http://localhost:3000/
```

**Resposta esperada:**
```json
{
  "message": "OpenFinance API - Sistema de Automação Financeira",
  "version": "1.0.0",
  "status": "online",
  "timestamp": "2024-10-28T..."
}
```

---

### 2️⃣ Testar conexão com Supabase
```bash
curl http://localhost:3000/api/test-supabase
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "✅ Conexão com Supabase estabelecida com sucesso!",
  "data": {
    "connected": true,
    "server": "Node.js + Express",
    "database": "Supabase (PostgreSQL)",
    "timestamp": "2024-10-28T..."
  }
}
```

---

### 3️⃣ Criar uma transação
```bash
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Almoço no restaurante\",\"amount\":-45.50,\"is_credit_card\":true,\"category\":\"Alimentação\",\"tags\":[\"restaurante\",\"almoço\"]}"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Transação salva com sucesso!",
  "data": {
    "id": "uuid-gerado-automaticamente",
    "description": "Almoço no restaurante",
    "amount": -45.50,
    "is_credit_card": true,
    "category": "Alimentação",
    "tags": ["restaurante", "almoço"],
    "month_year": "2024-10",
    "created_at": "2024-10-28T...",
    "location": null,
    "updated_at": "2024-10-28T..."
  }
}
```

---

### 4️⃣ Listar todas as transações
```bash
curl http://localhost:3000/api/transactions
```

---

### 5️⃣ Filtrar transações por mês
```bash
curl "http://localhost:3000/api/transactions?month_year=2024-10"
```

---

### 6️⃣ Filtrar transações de cartão de crédito
```bash
curl "http://localhost:3000/api/transactions?is_credit_card=true"
```

---

### 7️⃣ Filtrar por categoria
```bash
curl "http://localhost:3000/api/transactions?category=Alimentação"
```

---

### 8️⃣ Combinar múltiplos filtros
```bash
curl "http://localhost:3000/api/transactions?month_year=2024-10&is_credit_card=true&limit=5"
```

---

## 🧪 Testes via Postman/Insomnia

### POST /api/transaction

**URL:** `http://localhost:3000/api/transaction`  
**Method:** POST  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "description": "Supermercado",
  "amount": -250.00,
  "is_credit_card": false,
  "category": "Alimentação",
  "tags": ["mercado", "essencial"],
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "address": "São Paulo, SP"
  }
}
```

---

## 🗄️ Consultas SQL Diretas no Supabase

Você também pode testar diretamente no **SQL Editor** do Supabase:

### Ver todas as transações
```sql
SELECT * FROM transactions ORDER BY created_at DESC;
```

### Contar transações por categoria
```sql
SELECT category, COUNT(*) as total, SUM(amount) as total_amount
FROM transactions
GROUP BY category
ORDER BY total_amount;
```

### Ver transações do mês atual
```sql
SELECT * FROM transactions 
WHERE month_year = '2024-10'
ORDER BY created_at DESC;
```

### Buscar por tags
```sql
SELECT * FROM transactions 
WHERE 'urgente' = ANY(tags);
```

---

## ❌ Troubleshooting

### Erro: "SupabaseWrapper not initialized"
**Solução:** Verifique se o `.env` está configurado corretamente com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "relation 'transactions' does not exist"
**Solução:** Execute o arquivo `supabase-schema.sql` no SQL Editor do Supabase

### Erro de conexão
**Solução:** 
1. Verifique se as credenciais do Supabase estão corretas
2. Teste a conexão em: http://localhost:3000/api/test-supabase

---

## 📱 Testando do iPhone (Shortcut)

Seu iPhone pode enviar transações assim:

**URL:** `http://seu-ip-local:3000/api/transaction`  
**Method:** POST  
**Body:**
```json
{
  "description": "Café",
  "amount": -5.50,
  "is_credit_card": true,
  "category": "Alimentação"
}
```

---

## ✅ Próximos Passos

Depois que tudo estiver funcionando:

1. 🚀 Fazer deploy (Render, Railway, Fly.io)
2. 🔐 Adicionar autenticação (JWT ou Supabase Auth)
3. 📊 Criar endpoint de relatórios/dashboard
4. 📱 Conectar com seu Shortcut do iPhone

