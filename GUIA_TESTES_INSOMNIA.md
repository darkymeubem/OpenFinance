# 🧪 Guia de Testes com Insomnia

## 📥 Método 1: Importar Collection (Mais Rápido)

1. **Abra o Insomnia**
2. Clique em **"Application"** → **"Preferences"** → **"Data"** → **"Import Data"**
3. Selecione o arquivo `insomnia-collection.json`
4. Pronto! Todas as requisições estarão prontas

## 🎯 Método 2: Criar Manualmente

Se preferir criar manualmente, siga os passos abaixo:

---

## 1️⃣ Testar se a API está rodando

**Método:** `GET`  
**URL:** `http://localhost:3000/api/test`

**Resposta esperada:**

```json
{
  "success": true,
  "message": "API funcionando!",
  "data": {
    "server": "Node.js + Express",
    "database": "Supabase (PostgreSQL)",
    "timestamp": "2025-11-04T..."
  }
}
```

---

## 2️⃣ Testar Conexão com Supabase

**Método:** `GET`  
**URL:** `http://localhost:3000/api/test-supabase`

**Resposta esperada:**

```json
{
  "success": true,
  "message": "✅ Conexão com Supabase estabelecida com sucesso!",
  "data": {
    "connected": true,
    "server": "Node.js + Express",
    "database": "Supabase (PostgreSQL)",
    "timestamp": "2025-11-04T..."
  }
}
```

---

## 3️⃣ Testar Conexão com Notion

**Método:** `GET`  
**URL:** `http://localhost:3000/api/test-notion`

**Resposta esperada:**

```json
{
  "success": true,
  "message": "✅ Conexão com Notion estabelecida com sucesso!",
  "data": {
    "connected": true,
    "databaseId": "2a1484c476d980229874c09b63b59a29",
    "timestamp": "2025-11-04T..."
  }
}
```

---

## 4️⃣ Criar Transação Simples

**Método:** `POST`  
**URL:** `http://localhost:3000/api/transaction`  
**Headers:**

- `Content-Type: application/json`

**Body (JSON):**

```json
{
  "description": "Teste Insomnia - Compra Supermercado",
  "amount": -150.5,
  "is_credit_card": false
}
```

**Resposta esperada:**

```json
{
  "success": true,
  "message": "Transação salva com sucesso!",
  "data": {
    "id": "uuid-aqui",
    "description": "Teste Insomnia - Compra Supermercado",
    "amount": -150.5,
    "is_credit_card": false,
    "month_year": "2025-11",
    "created_at": "2025-11-04T...",
    "notion_page_id": "id-da-pagina-notion"
  }
}
```

**✅ Verificar:**

- Abra o database "Transações" no Notion
- A transação deve aparecer lá!

---

## 5️⃣ Criar Transação Completa (com todos os campos)

**Método:** `POST`  
**URL:** `http://localhost:3000/api/transaction`  
**Headers:**

- `Content-Type: application/json`

**Body (JSON):**

```json
{
  "description": "Jantar Italiano",
  "amount": -285.0,
  "is_credit_card": true,
  "category": "Alimentação",
  "tags": ["restaurante", "jantar", "italiano"],
  "location": {
    "latitude": -23.55052,
    "longitude": -46.633308,
    "address": "São Paulo, SP"
  }
}
```

**O que acontece:**

1. ✅ Salva no Supabase
2. ✅ Cria página no Notion com TODOS os campos preenchidos
3. ✅ Retorna o ID da página do Notion

---

## 6️⃣ Listar Todas as Transações

**Método:** `GET`  
**URL:** `http://localhost:3000/api/transactions`

**Resposta esperada:**

```json
{
  "success": true,
  "message": "Lista de transações",
  "data": [
    {
      "id": "uuid-1",
      "description": "Jantar Italiano",
      "amount": -285.0,
      "is_credit_card": true,
      "category": "Alimentação",
      "tags": ["restaurante", "jantar", "italiano"],
      "notion_page_id": "notion-id-1",
      "created_at": "2025-11-04T..."
    },
    {
      "id": "uuid-2",
      "description": "Teste Insomnia - Compra Supermercado",
      "amount": -150.5,
      "is_credit_card": false,
      "notion_page_id": "notion-id-2",
      "created_at": "2025-11-04T..."
    }
  ],
  "total": 2
}
```

---

## 7️⃣ Filtrar por Mês/Ano

**Método:** `GET`  
**URL:** `http://localhost:3000/api/transactions?month_year=2025-11`

Retorna apenas transações de novembro/2025

---

## 8️⃣ Filtrar por Categoria

**Método:** `GET`  
**URL:** `http://localhost:3000/api/transactions?category=Alimentação`

Retorna apenas transações da categoria "Alimentação"

---

## 9️⃣ Filtrar apenas Cartão de Crédito

**Método:** `GET`  
**URL:** `http://localhost:3000/api/transactions?is_credit_card=true`

Retorna apenas transações de cartão de crédito

---

## 🔟 Criar Receita (valor positivo)

**Método:** `POST`  
**URL:** `http://localhost:3000/api/transaction`  
**Headers:**

- `Content-Type: application/json`

**Body (JSON):**

```json
{
  "description": "Salário Mensal",
  "amount": 5000.0,
  "is_credit_card": false,
  "category": "Receita",
  "tags": ["salário", "mensal"]
}
```

**Nota:** Valores **positivos** = receitas, **negativos** = despesas

---

## 🎨 Exemplos Adicionais

### Despesa com Cartão de Crédito

```json
{
  "description": "Fatura Netflix",
  "amount": -55.9,
  "is_credit_card": true,
  "category": "Assinaturas",
  "tags": ["streaming", "mensal", "netflix"]
}
```

### Transferência Bancária

```json
{
  "description": "Transferência para Poupança",
  "amount": -1000.0,
  "is_credit_card": false,
  "category": "Investimentos",
  "tags": ["poupança", "investimento"]
}
```

### Compra Online

```json
{
  "description": "Livros na Amazon",
  "amount": -120.0,
  "is_credit_card": true,
  "category": "Educação",
  "tags": ["livros", "amazon", "desenvolvimento"]
}
```

---

## 📊 Fluxo de Teste Completo

1. ✅ `GET /api/test` - Confirmar que API está online
2. ✅ `GET /api/test-supabase` - Confirmar conexão Supabase
3. ✅ `GET /api/test-notion` - Confirmar conexão Notion
4. ✅ `POST /api/transaction` - Criar transação de teste
5. ✅ **Verificar no Notion** - Ver se apareceu no database
6. ✅ `GET /api/transactions` - Listar todas e confirmar sincronização
7. ✅ Criar mais transações com diferentes categorias e tags
8. ✅ Testar filtros (por mês, categoria, cartão)

---

## 🎯 Dicas do Insomnia

### Organizar Requests

- Crie uma **Collection** chamada "OpenFinance API"
- Crie **pastas** para: Testes, Transações, Filtros
- Use **Environments** para alternar entre dev/prod

### Usar Variáveis

No Insomnia, você pode criar variáveis de ambiente:

```json
{
  "base_url": "http://localhost:3000",
  "api_path": "/api"
}
```

Então usar nas URLs: `{{ base_url }}{{ api_path }}/transaction`

### Salvar Responses

- Use a aba "Timeline" para ver histórico de requisições
- Copie IDs das transações criadas para testar updates/deletes

---

## ❓ Troubleshooting

### Erro: "ECONNREFUSED"

- ❌ O servidor não está rodando
- ✅ Execute `npm run dev` no terminal

### Erro: 400 "Descrição e valor são obrigatórios"

- ❌ Faltou campo obrigatório no body
- ✅ Certifique-se de incluir `description` e `amount`

### Erro: 500 "Erro ao salvar transação"

- ❌ Problema com Supabase ou Notion
- ✅ Verifique os logs do servidor no terminal
- ✅ Teste as rotas `/api/test-supabase` e `/api/test-notion`

### Transação salva mas não aparece no Notion

- ⚠️ Sincronização com Notion falhou (mas salva no Supabase)
- ✅ Verifique os logs - deve ter uma mensagem de erro
- ✅ Confirme que a integração tem acesso ao database

---

## 🎉 Sucesso!

Se todos os testes passarem:

- ✅ API funcionando
- ✅ Supabase conectado
- ✅ Notion sincronizando
- ✅ Transações sendo criadas e listadas

**Próximo passo:** Configurar o Shortcut no iPhone! 📱
