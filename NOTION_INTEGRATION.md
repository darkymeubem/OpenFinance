# 🔗 Integração com Notion

Este documento explica como configurar e usar a integração do OpenFinance com o Notion.

## 📋 Pré-requisitos

1. Uma conta no Notion
2. Um database no Notion com a estrutura correta
3. Uma integração Notion criada

## 🚀 Configuração

### 1. Criar uma Integração no Notion

1. Acesse https://www.notion.so/my-integrations
2. Clique em "+ New integration"
3. Dê um nome (ex: "OpenFinance")
4. Selecione o workspace
5. Copie o **Internal Integration Token** (começa com `secret_...`)

### 2. Criar o Database no Notion

Crie um database no Notion com as seguintes colunas:

| Nome da Coluna   | Tipo         | Descrição                             |
| ---------------- | ------------ | ------------------------------------- |
| **Descrição**    | Title        | Título da transação                   |
| **Valor**        | Number       | Valor da transação                    |
| **Categoria**    | Text         | Categoria da transação                |
| **MesAno**       | Text         | Referência mês/ano (formato: 2025-11) |
| **IsCreditCard** | Checkbox     | Indica se é cartão de crédito         |
| **Criado**       | Date         | Data de criação                       |
| **Atualizado**   | Date         | Data de atualização                   |
| **Tags**         | Multi-select | Etiquetas (tags)                      |
| **Localização**  | Text         | Localização (endereço ou coordenadas) |

### 3. Conectar a Integração ao Database

1. Abra o database no Notion
2. Clique nos 3 pontinhos no canto superior direito
3. Clique em "Add connections"
4. Selecione sua integração (ex: "OpenFinance")

### 4. Obter o ID do Database

O ID do database está na URL do Notion:

```
https://www.notion.so/workspace/DATABASE_ID?v=...
                               ^^^^^^^^^^^
                               Este é o ID
```

Ou use este formato:

```
https://www.notion.so/DATABASE_ID
```

### 5. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Notion Configuration
NOTION_TOKEN=secret_sua_chave_de_integracao_do_notion
NOTION_DATABASE_ID=id_do_seu_database_notion
```

## ✅ Testar a Integração

### 1. Iniciar o Servidor

```bash
npm run dev
```

Você deve ver:

```
✅ Supabase inicializado com sucesso!
✅ Notion inicializado com sucesso!
🚀 Servidor rodando na porta 3000
```

### 2. Testar Conexão com Notion

```bash
curl http://localhost:3000/api/test-notion
```

Resposta esperada:

```json
{
  "success": true,
  "message": "✅ Conexão com Notion estabelecida com sucesso!",
  "data": {
    "connected": true,
    "databaseId": "seu-database-id",
    "timestamp": "2025-11-04T..."
  }
}
```

### 3. Criar uma Transação

```bash
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Teste de integração Notion",
    "amount": -50.00,
    "is_credit_card": false,
    "category": "Teste",
    "tags": ["teste", "notion"]
  }'
```

A transação será:

1. ✅ Salva no Supabase
2. ✅ Criada no Notion
3. ✅ O ID da página do Notion será armazenado no Supabase

## 🔄 Funcionalidades

### Sincronização Automática

Todas as operações são sincronizadas automaticamente:

#### ✨ CREATE (POST /api/transaction)

- Cria transação no Supabase
- Cria página no database do Notion
- Salva o `notion_page_id` no Supabase

#### 📝 UPDATE (PUT /api/transaction/:id)

- Atualiza transação no Supabase
- Atualiza página no Notion (se `notion_page_id` existir)
- Atualiza automaticamente o campo "Atualizado" no Notion

#### 🗑️ DELETE (DELETE /api/transaction/:id)

- Deleta transação do Supabase
- Arquiva página no Notion (não deleta permanentemente)

### Tratamento de Erros

Se houver erro na sincronização com o Notion:

- ⚠️ A operação no Supabase **continua normalmente**
- ⚠️ Um log de erro é exibido no console
- ⚠️ A API retorna sucesso (porque o Supabase foi atualizado)

Isso garante que sua aplicação continue funcionando mesmo se o Notion estiver offline.

## 📊 Estrutura de Dados

### Mapeamento: Supabase → Notion

| Campo Supabase     | Campo Notion | Tipo Notion  |
| ------------------ | ------------ | ------------ |
| `description`      | Descrição    | Title        |
| `amount`           | Valor        | Number       |
| `category`         | Categoria    | Text         |
| `month_year`       | MesAno       | Text         |
| `is_credit_card`   | IsCreditCard | Checkbox     |
| `created_at`       | Criado       | Date         |
| `updated_at`       | Atualizado   | Date         |
| `tags`             | Tags         | Multi-select |
| `location.address` | Localização  | Text         |

### Campos Opcionais

Os seguintes campos são opcionais e só serão adicionados se fornecidos:

- `category`
- `tags`
- `location`

## 🛠️ Desenvolvimento

### Arquivos Criados

```
src/
├── config/
│   └── notion-wrapper.ts        # Gerencia conexão com Notion API
├── services/
│   ├── NotionService.ts         # Lógica de integração com Notion
│   └── TransactionService.ts    # Atualizado com sincronização
└── types/
    └── Transaction.ts           # Adicionado campo notion_page_id
```

### Classes e Métodos

#### NotionService

```typescript
// Criar transação no Notion
await notionService.createTransaction(transaction);

// Atualizar transação no Notion
await notionService.updateTransaction(notionPageId, transaction);

// Arquivar transação no Notion
await notionService.deleteTransaction(notionPageId);

// Testar conexão
await notionService.testConnection();
```

## 🐛 Troubleshooting

### Erro: "NOTION_TOKEN não está configurado"

- Verifique se o arquivo `.env` existe
- Verifique se a variável `NOTION_TOKEN` está definida
- Reinicie o servidor após modificar o `.env`

### Erro: "NOTION_DATABASE_ID não está configurado"

- Verifique se copiou o ID correto do database
- O ID deve ter 32 caracteres (formato UUID)

### Erro: "Falha ao criar página no Notion"

- Verifique se a integração tem acesso ao database
- Verifique se os nomes das colunas estão corretos
- Verifique se os tipos das colunas correspondem ao esperado

### Transação salva no Supabase mas não no Notion

- Isso é esperado se houver erro no Notion
- Verifique os logs do servidor para detalhes
- A transação pode ser sincronizada manualmente depois

## 📝 Notas Importantes

1. **IDs das Colunas**: Os nomes das colunas no Notion devem ser EXATAMENTE:

   - `Descrição` (com ç)
   - `Valor`
   - `Categoria`
   - `MesAno` (tudo junto, sem espaço)
   - `IsCreditCard` (camelCase)
   - `Criado`
   - `Atualizado`
   - `Tags`
   - `Localização` (com ç)

2. **Database ID**: O ID do database pode ter hífens ou não:

   - Com hífens: `12345678-1234-1234-1234-123456789abc`
   - Sem hífens: `12345678123412341234123456789abc`
   - Ambos funcionam!

3. **Token de Integração**: Sempre começa com `secret_`

4. **Arquivamento**: Deletar uma transação no Supabase arquiva (não deleta) a página no Notion
