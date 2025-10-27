import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

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
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📦 Corpo da requisição:', JSON.stringify(req.body, null, 2));
    } else {
      console.log('⚠️ Requisição sem corpo');
    }
  }
  
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'OpenFinance API - Sistema de Automação Financeira',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando!',
    data: {
      server: 'Node.js + Express',
      database: 'Firebase',
      timestamp: new Date().toISOString()
    }
  });
});

// Rota para receber transações do iPhone
app.post('/api/transaction', (req, res) => {
  try {
    const { description, amount, is_credit_card, category } = req.body;
    
    // Validar dados básicos
    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Descrição e valor são obrigatórios'
      });
    }
    
    // Log da transação recebida
    console.log('📱 Nova transação recebida:', {
      description,
      amount,
      is_credit_card,
      category,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Transação recebida com sucesso!',
      data: {
        id: Date.now(),
        description,
        amount,
        is_credit_card,
        category,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao processar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para listar transações
app.get('/api/transactions', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Lista de transações',
      data: [],
      total: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar transações'
    });
  }
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro na API:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 OpenFinance API - Sistema de Automação Financeira`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Teste: http://localhost:${PORT}`);
  console.log(`📱 Endpoint para iPhone: http://localhost:${PORT}/api/transaction`);
});

export default app;