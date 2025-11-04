# 🧪 Como Testar a Integração com o Notion

## ✅ Checklist de Configuração

Antes de testar, certifique-se de que você tem:

- [ ] Token de integração do Notion (começa com `secret_`)
- [ ] ID do database do Notion
- [ ] Database no Notion com as colunas corretas
- [ ] Integração conectada ao database
- [ ] Variáveis `NOTION_TOKEN` e `NOTION_DATABASE_ID` no arquivo `.env`

## 📝 Estrutura das Colunas no Notion

Crie um database no Notion com estas colunas (os nomes devem ser EXATOS):

| Nome         | Tipo         |
| ------------ | ------------ |
| Descrição    | Title        |
| Valor        | Number       |
| Categoria    | Text         |
| MesAno       | Text         |
| IsCreditCard | Checkbox     |
| Criado       | Date         |
| Atualizado   | Date         |
| Tags         | Multi-select |
| Localização  | Text         |

## 🚀 Passos para Testar

### 1. Iniciar o Servidor

```powershell
npm run dev
```

**Resultado esperado:**

```
✅ Supabase inicializado com sucesso!
✅ Notion inicializado com sucesso!
🚀 Servidor rodando na porta 3000
```

Se aparecer erro no Notion, verifique as variáveis de ambiente.

### 2. Testar Conexão com Notion

Abra outro terminal e execute:

```powershell
curl http://localhost:3000/api/test-notion
```

Ou abra no navegador: http://localhost:3000/api/test-notion

**Resultado esperado:**

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

### 3. Criar uma Transação (Teste Completo)

```powershell
curl -X POST http://localhost:3000/api/transaction `
  -H "Content-Type: application/json" `
  -d '{
    "description": "Teste Notion Integration",
    "amount": -100.50,
    "is_credit_card": false,
    "category": "Teste",
    "tags": ["teste", "notion", "integracao"]
  }'
```

**O que acontece:**

1. ✅ Transação é salva no Supabase
2. ✅ Página é criada no Notion
3. ✅ ID da página do Notion é salvo no Supabase (campo `notion_page_id`)

**Verificar:**

- Abra seu database no Notion
- Você deve ver uma nova linha com a transação
- No terminal do servidor, você verá logs de sucesso

### 4. Atualizar a Transação

Primeiro, pegue o ID da transação na resposta do POST acima, depois:

```powershell
curl -X PUT http://localhost:3000/api/transaction/SEU_ID_AQUI `
  -H "Content-Type: application/json" `
  -d '{
    "description": "Teste ATUALIZADO",
    "amount": -200.00
  }'
```

**Verificar:**

- No Notion, a transação deve ser atualizada
- O campo "Atualizado" deve ter a data/hora atual

### 5. Listar Transações

```powershell
curl http://localhost:3000/api/transactions
```

Você verá todas as transações com o campo `notion_page_id` preenchido.

## 🐛 Possíveis Erros e Soluções

### Erro: "NOTION_TOKEN não está configurado"

**Solução:**

1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Adicione a linha: `NOTION_TOKEN=secret_sua_chave`
3. Reinicie o servidor

### Erro: "NOTION_DATABASE_ID não está configurado"

**Solução:**

1. Copie o ID do database da URL do Notion
2. Adicione ao `.env`: `NOTION_DATABASE_ID=seu_id`
3. Reinicie o servidor

### Erro: "Could not find database"

**Solução:**

1. Verifique se o ID do database está correto
2. Abra o database no Notion
3. Clique em "..." → "Add connections"
4. Adicione sua integração

### Transação salva no Supabase mas não no Notion

**Isso é normal!** O sistema foi projetado para continuar funcionando mesmo se o Notion estiver offline.

**Verificar:**

1. Veja os logs no terminal do servidor
2. Procure por mensagens como "⚠️ Erro ao sincronizar com o Notion"
3. Corrija o problema (token, database ID, permissões)
4. As próximas transações serão sincronizadas normalmente

## 📊 Logs do Servidor

Durante os testes, você verá logs como:

```
✅ Transação criada no Notion: abc123-page-id
✅ Transação salva no Supabase e Notion
```

Ou em caso de erro:

```
⚠️ Erro ao sincronizar com o Notion: [mensagem de erro]
ℹ️ Transação salva apenas no Supabase
```

## 🎯 Exemplo Completo de Teste

### 1. Criar transação com todos os campos

```powershell
curl -X POST http://localhost:3000/api/transaction `
  -H "Content-Type: application/json" `
  -d '{
    "description": "Compra no Mercado",
    "amount": -350.00,
    "is_credit_card": true,
    "category": "Alimentação",
    "tags": ["supermercado", "essencial"],
    "location": {
      "latitude": -23.550520,
      "longitude": -46.633308,
      "address": "São Paulo, SP"
    }
  }'
```

### 2. Verificar no Notion

Você verá no Notion:

- **Descrição**: Compra no Mercado
- **Valor**: -350
- **Categoria**: Alimentação
- **MesAno**: 2025-11 (gerado automaticamente)
- **IsCreditCard**: ✅ (marcado)
- **Criado**: Data/hora atual
- **Atualizado**: Data/hora atual
- **Tags**: supermercado, essencial
- **Localização**: São Paulo, SP

## ✨ Recursos Extras

### Filtrar transações por mês

```powershell
curl "http://localhost:3000/api/transactions?month_year=2025-11"
```

### Filtrar por categoria

```powershell
curl "http://localhost:3000/api/transactions?category=Alimentação"
```

### Filtrar apenas cartão de crédito

```powershell
curl "http://localhost:3000/api/transactions?is_credit_card=true"
```

## 📱 Testando com iPhone

Se você estiver usando o Shortcuts do iPhone, a transação será criada da mesma forma e sincronizada automaticamente com o Notion!

Basta configurar o Shortcut para enviar POST para:

```
http://seu-servidor:3000/api/transaction
```

---

## 💡 Dicas

1. **Mantenha o terminal aberto** para ver os logs em tempo real
2. **Use o Postman ou Insomnia** para testes mais complexos
3. **Configure notificações no Notion** para ser alertado de novas transações
4. **Crie views personalizadas** no Notion para visualizar suas transações

## ❓ Precisa de Ajuda?

Verifique o arquivo `NOTION_INTEGRATION.md` para documentação completa da integração.
