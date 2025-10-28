# 🚀 Guia de Migração - Firebase para Supabase

## 📋 Passo 1: Criar o Banco de Dados no Supabase

### 1.1 Acessar o SQL Editor
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

### 1.2 Executar o Schema
1. Copie todo o conteúdo do arquivo `supabase-schema.sql`
2. Cole no SQL Editor
3. Clique em **Run** (ou pressione `Ctrl+Enter`)

✅ Se tudo correr bem, você verá: "Success. No rows returned"

---

## 📊 Passo 2: Verificar a Estrutura Criada

No Supabase, vá em **Table Editor** e você verá:
- Tabela `transactions` com todas as colunas
- Índices criados para otimizar as consultas

### Estrutura da Tabela:
```
transactions
├── id (UUID, PRIMARY KEY)
├── description (TEXT)
├── amount (DECIMAL)
├── created_at (TIMESTAMP)
├── is_credit_card (BOOLEAN)
├── month_year (VARCHAR)
├── category (VARCHAR)
├── tags (TEXT[])
├── location (JSONB)
└── updated_at (TIMESTAMP)
```

---

## 🔄 Passo 3: Migrar Dados do Firebase (Opcional)

### Opção A: Migração Manual (poucos dados)
Se você tem poucas transações, pode inseri-las manualmente via SQL:

```sql
INSERT INTO transactions (description, amount, is_credit_card, month_year, category, tags, location)
VALUES 
    ('Descrição', 100.50, false, '2024-10', 'Categoria', ARRAY['tag1', 'tag2'], 
     '{"latitude": -23.5505, "longitude": -46.6333, "address": "Endereço"}'::jsonb);
```

### Opção B: Exportar do Firebase e Importar
1. **Exportar do Firebase:**
   - Firebase Console → Firestore → Exportar coleção
   - Ou criar script para exportar via API

2. **Transformar JSON → SQL:**
   - Converter o formato Firebase para SQL INSERT statements

3. **Importar no Supabase:**
   - Executar os INSERTs no SQL Editor

### Opção C: Rodar ambos em paralelo
- Mantenha o Firebase ativo
- Configure o Supabase
- Migre gradualmente enquanto usa ambos

---

## 🔑 Passo 4: Configurar Variáveis de Ambiente

Já atualizamos o `env.example`. Agora configure seu `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Para obter as credenciais:**
1. Supabase Dashboard → Settings → API
2. Copie **Project URL** → `SUPABASE_URL`
3. Copie **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Passo 5: Testar a Conexão

### Via SQL Editor (no Supabase):
```sql
-- Inserir teste
INSERT INTO transactions (description, amount, is_credit_card, month_year, category)
VALUES ('Teste de Conexão', 10.00, false, '2024-10', 'Teste');

-- Consultar
SELECT * FROM transactions WHERE category = 'Teste';

-- Deletar teste
DELETE FROM transactions WHERE category = 'Teste';
```

### Via API (depois de atualizar o código):
```bash
# Testar endpoint
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Teste via API",
    "amount": 50.00,
    "is_credit_card": false,
    "category": "Teste"
  }'
```

---

## 📦 Próximos Passos

Agora você precisa:

1. ✅ Banco criado no Supabase
2. ⏳ Atualizar `TransactionService.ts` para usar Supabase em vez de Firebase
3. ⏳ Atualizar `src/index.ts` para inicializar o Supabase
4. ⏳ Testar todas as rotas

**Quer que eu ajude a atualizar o código do TransactionService para usar o Supabase?** 🚀

---

## 🔍 Dicas Importantes

### Diferenças Firebase vs PostgreSQL:
- **Firebase:** NoSQL, usa coleções e documentos
- **PostgreSQL:** SQL relacional, usa tabelas e linhas
- **IDs:** Firebase gera strings aleatórias, PostgreSQL usa UUID
- **Datas:** Firebase usa Timestamp, PostgreSQL usa TIMESTAMP WITH TIME ZONE
- **Arrays:** Firebase tem arrays simples, PostgreSQL tem tipo TEXT[]
- **Objetos:** Firebase tem mapas, PostgreSQL usa JSONB

### Vantagens do Supabase:
✅ SQL poderoso com JOINs, agregações, etc.
✅ Índices para consultas rápidas
✅ Triggers e functions no banco
✅ Row Level Security nativo
✅ Backups automáticos
✅ Interface visual para gerenciar dados

