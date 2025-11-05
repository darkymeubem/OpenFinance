import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { SupabaseWrapper } from "./config/supabase-wrapper";
import { NotionWrapper } from "./config/notion-wrapper";
import transactionService from "./services/TransactionService";
import notionService from "./services/NotionService";

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Supabase
try {
  SupabaseWrapper.init();
  console.log("✅ Supabase inicializado com sucesso!");
} catch (error: any) {
  console.error("❌ Erro ao inicializar Supabase:", error.message);
  process.exit(1);
}

// Inicializar Notion (opcional)
const hasNotionConfig =
  process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID;

if (hasNotionConfig) {
  try {
    NotionWrapper.init();
    console.log("✅ Notion inicializado com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao inicializar Notion:", error.message);
    console.log("⚠️ Continuando sem integração com o Notion...");
  }
} else {
  console.log(
    "ℹ️ Notion não configurado - a aplicação funcionará apenas com Supabase"
  );
  console.log(
    "ℹ️ Para habilitar o Notion, configure NOTION_TOKEN e NOTION_DATABASE_ID no .env"
  );
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Middleware para parsing JSON
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);

  // Log do corpo da requisição para métodos POST, PUT, PATCH
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log("📦 Corpo da requisição:", JSON.stringify(req.body, null, 2));
    } else {
      console.log("⚠️ Requisição sem corpo");
    }
  }

  next();
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "OpenFinance API - Sistema de Automação Financeira",
    version: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

// Rota de teste
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando!",
    data: {
      server: "Node.js + Express",
      database: "Supabase (PostgreSQL)",
      timestamp: new Date().toISOString(),
    },
  });
});

// Rota de teste de conexão com Supabase
app.get("/api/test-supabase", async (req, res) => {
  try {
    console.log("🔍 Testando conexão com Supabase...");

    const supabase = SupabaseWrapper.get();

    // Tenta fazer uma query simples na tabela transactions
    const { data, error } = await supabase
      .from("transactions")
      .select("count")
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      message: "✅ Conexão com Supabase estabelecida com sucesso!",
      data: {
        connected: true,
        server: "Node.js + Express",
        database: "Supabase (PostgreSQL)",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao conectar com Supabase:", error.message);

    res.status(500).json({
      success: false,
      message: "❌ Falha na conexão com Supabase",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Erro ao conectar com o banco de dados",
      details:
        process.env.NODE_ENV === "development"
          ? {
              hasSupabaseUrl: !!process.env.SUPABASE_URL,
              hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            }
          : undefined,
    });
  }
});

// Rota de teste de conexão com Notion
app.get("/api/test-notion", async (req, res) => {
  try {
    console.log("🔍 Testando conexão com Notion...");
    console.log(`📝 Database ID: ${process.env.NOTION_DATABASE_ID}`);
    console.log(
      `🔑 Token (primeiros 20 chars): ${process.env.NOTION_TOKEN?.substring(
        0,
        20
      )}...`
    );

    const isConnected = await notionService.testConnection();

    if (!isConnected) {
      throw new Error("Falha ao conectar com o database do Notion");
    }

    res.json({
      success: true,
      message: "✅ Conexão com Notion estabelecida com sucesso!",
      data: {
        connected: true,
        databaseId: process.env.NOTION_DATABASE_ID,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("❌ Erro detalhado ao conectar com Notion:");
    console.error("   Mensagem:", error.message);
    console.error("   Código:", error.code);
    console.error("   Status:", error.status);

    // Mensagens de erro mais específicas
    let errorMessage = error.message;
    let helpText = "";

    if (error.code === "object_not_found" || error.status === 404) {
      errorMessage = "Database não encontrado";
      helpText =
        "Verifique se: 1) O ID do database está correto, 2) A integração tem acesso ao database (clique em '...' > 'Add connections' no Notion)";
    } else if (error.code === "unauthorized" || error.status === 401) {
      errorMessage = "Token de autenticação inválido";
      helpText =
        "Verifique se o NOTION_TOKEN está correto e começa com 'secret_'";
    } else if (error.code === "restricted_resource" || error.status === 403) {
      errorMessage =
        "A integração não tem permissão para acessar este database";
      helpText =
        "Abra o database no Notion, clique em '...' (três pontos), vá em 'Add connections' e adicione sua integração";
    }

    res.status(500).json({
      success: false,
      message: "❌ Falha na conexão com Notion",
      error: errorMessage,
      help: helpText,
      details:
        process.env.NODE_ENV === "development"
          ? {
              hasNotionToken: !!process.env.NOTION_TOKEN,
              tokenPrefix: process.env.NOTION_TOKEN?.substring(0, 7),
              hasNotionDatabaseId: !!process.env.NOTION_DATABASE_ID,
              databaseId: process.env.NOTION_DATABASE_ID,
              errorCode: error.code,
              errorStatus: error.status,
            }
          : undefined,
    });
  }
});

// Rota para receber transações do iPhone
app.post("/api/transaction", async (req, res) => {
  try {
    console.log("🔍 DEBUG - Body recebido:", req.body);
    console.log("🔍 DEBUG - Tipo do body:", typeof req.body);
    console.log("🔍 DEBUG - Keys do body:", Object.keys(req.body));

    // Verificar se o Shortcuts enviou o dicionário como string dentro de "JSON"
    let bodyData = req.body;
    if (req.body.JSON && typeof req.body.JSON === "string") {
      console.log(
        "🔧 Detectado body em formato de string JSON, fazendo parse..."
      );
      try {
        bodyData = JSON.parse(req.body.JSON);
        console.log("✅ Parse realizado com sucesso:", bodyData);
      } catch (e) {
        console.error("❌ Erro ao fazer parse do JSON:", e);
      }
    }

    // Normalizar keys (remover espaços extras)
    const normalizedBody: any = {};
    for (const key in bodyData) {
      const normalizedKey = key.trim();
      let value = bodyData[key];

      // Remover espaços extras dos valores também
      if (typeof value === "string") {
        value = value.trim();
      }

      normalizedBody[normalizedKey] = value;
    }

    let { description, amount, is_credit_card, category, tags, location } =
      normalizedBody;

    console.log(
      "🔍 DEBUG - description:",
      description,
      "tipo:",
      typeof description
    );
    console.log("🔍 DEBUG - amount:", amount, "tipo:", typeof amount);
    console.log(
      "🔍 DEBUG - category:",
      typeof category === "string" ? category.substring(0, 50) : category
    );
    console.log(
      "🔍 DEBUG - location:",
      typeof location === "string" ? location.substring(0, 50) : location
    );

    // Validar dados básicos
    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: "Descrição e valor são obrigatórios",
        debug: {
          receivedBody: req.body,
          normalizedBody: normalizedBody,
          description: description,
          amount: amount,
          hasDescription: !!description,
          hasAmount: !!amount,
        },
      });
    }

    // Processar location se vier como string JSON
    if (location && typeof location === "string") {
      try {
        const locationObj = JSON.parse(location);
        let address = locationObj.address || locationObj.adress; // typo no shortcuts

        // Formatar o endereço
        if (address) {
          address = address
            .replace(/\n+/g, ", ")
            .replace(/\s*,\s*/g, ", ")
            .replace(/,+/g, ", ")
            .trim();
        }

        location = {
          latitude: Number(locationObj.latitude),
          longitude: Number(locationObj.longitude),
          address: address,
        };
        console.log("✅ Location convertido para objeto:", location);
      } catch (e) {
        console.log("⚠️ Erro ao parsear location, usando como string");
        location = undefined; // Ignorar location inválido
      }
    }

    // Se location já for objeto (vindo do Shortcuts como arquivo), normalizar
    if (location && typeof location === "object") {
      let address = location.address || location.adress; // typo no shortcuts

      // Formatar o endereço: remover quebras de linha excessivas e normalizar espaços
      if (address) {
        address = address
          .replace(/\n+/g, ", ") // Substituir quebras de linha por vírgulas
          .replace(/\s*,\s*/g, ", ") // Normalizar espaços em volta das vírgulas
          .replace(/,+/g, ", ") // Remover vírgulas duplicadas
          .trim();
      }

      location = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: address,
      };
      console.log("✅ Location normalizado:", location);
    }

    // Validar category - se vier muito grande ou JSON, usar valor padrão
    if (category && category.length > 100) {
      console.log("⚠️ Category muito grande, usando 'Outros'");
      category = "Outros";
    }

    // Se category parecer ser JSON (começa com {), usar valor padrão
    if (category && category.startsWith("{")) {
      console.log("⚠️ Category parece ser JSON, usando 'Outros'");
      category = "Outros";
    }

    // Processar tags - se vier como string, separar por vírgula/quebra de linha
    if (tags && typeof tags === "string") {
      // Separar por vírgula, ponto-e-vírgula ou quebra de linha
      tags = tags
        .split(/[,;\n]+/) // Divide por vírgula, ponto-e-vírgula ou quebra de linha
        .map((tag) => tag.trim()) // Remove espaços extras
        .filter((tag) => tag.length > 0); // Remove tags vazias

      console.log("✅ Tags processadas:", tags);
    }

    // Log da transação recebida
    console.log("📱 Nova transação recebida:", {
      description,
      amount,
      is_credit_card,
      category,
      timestamp: new Date().toISOString(),
    });

    // Salvar no Supabase
    const transaction = await transactionService.create({
      description,
      amount: Number(amount),
      is_credit_card: Boolean(is_credit_card),
      category,
      tags,
      location,
    });

    res.json({
      success: true,
      message: "Transação salva com sucesso!",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Erro ao processar transação:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao salvar transação",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Rota para listar transações
app.get("/api/transactions", async (req, res) => {
  try {
    const { month_year, category, is_credit_card, limit, offset } = req.query;

    const filters: any = {};
    if (month_year) filters.month_year = month_year as string;
    if (category) filters.category = category as string;
    if (is_credit_card !== undefined)
      filters.is_credit_card = is_credit_card === "true";
    if (limit) filters.limit = Number(limit);
    if (offset) filters.offset = Number(offset);

    const transactions = await transactionService.findMany(filters);

    res.json({
      success: true,
      message: "Lista de transações",
      data: transactions,
      total: transactions.length,
    });
  } catch (error: any) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar transações",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Middleware de tratamento de erros
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Erro na API:", err);
    res.status(500).json({
      error: "Erro interno do servidor",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Algo deu errado",
    });
  }
);

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    message: `A rota ${req.originalUrl} não existe`,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 OpenFinance API - Sistema de Automação Financeira`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Teste: http://localhost:${PORT}`);
  console.log(
    `📱 Endpoint para iPhone: http://localhost:${PORT}/api/transaction`
  );
});

export default app;
