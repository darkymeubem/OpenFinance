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

// Inicializar Notion
try {
  NotionWrapper.init();
  console.log("✅ Notion inicializado com sucesso!");
} catch (error: any) {
  console.error("❌ Erro ao inicializar Notion:", error.message);
  console.log("⚠️ Continuando sem integração com o Notion...");
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
    console.error("❌ Erro ao conectar com Notion:", error.message);

    res.status(500).json({
      success: false,
      message: "❌ Falha na conexão com Notion",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Erro ao conectar com o Notion",
      details:
        process.env.NODE_ENV === "development"
          ? {
              hasNotionToken: !!process.env.NOTION_TOKEN,
              hasNotionDatabaseId: !!process.env.NOTION_DATABASE_ID,
            }
          : undefined,
    });
  }
});

// Rota para receber transações do iPhone
app.post("/api/transaction", async (req, res) => {
  try {
    const { description, amount, is_credit_card, category, tags, location } =
      req.body;

    // Validar dados básicos
    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: "Descrição e valor são obrigatórios",
      });
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
