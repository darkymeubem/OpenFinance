// Interface principal da transação (baseada no seu Firebase)
export interface Transaction {
    id?: string;
    description: string;
    amount: number;
    created_at: Date;
    is_credit_card: boolean;
    month_year: string;
    category?: string;
    tags?: string[];
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }
  
  // Interface para criar nova transação (sem id e created_at)
  export interface CreateTransactionDTO {
    description: string;
    amount: number;
    is_credit_card: boolean;
    month_year?: string;
    category?: string;
    tags?: string[];
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }
  
  // Interface para atualizar transação
  export interface UpdateTransactionDTO {
    description?: string;
    amount?: number;
    is_credit_card?: boolean;
    category?: string;
    tags?: string[];
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }
  
  // Interface para filtros de busca
  export interface TransactionFilters {
    month_year?: string;
    category?: string;
    is_credit_card?: boolean;
    limit?: number;
    offset?: number;
  }
  
  // Interface para resposta da API
  export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
    statusCode: number;
  }
  
  // Interface para resumo financeiro
  export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savingsRate: number;
    topCategories: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  }