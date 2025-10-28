import { SupabaseWrapper } from "../config/supabase-wrapper";
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from "../types/Transaction";

export class TransactionService {
  private readonly tableName = "transactions";

  /**
   * Cria uma nova transação no Supabase
   */
  async create(data: CreateTransactionDTO): Promise<Transaction> {
    try {
      const supabase = SupabaseWrapper.get();
      const now = new Date().toISOString();
      const month_year = data.month_year || this.formatMonthYear(new Date());

      // Preparar dados removendo campos undefined
      const transactionData: any = {
        description: data.description,
        amount: data.amount,
        is_credit_card: data.is_credit_card,
        month_year,
        created_at: now,
      };

      // Adicionar apenas campos definidos
      if (data.category) transactionData.category = data.category;
      if (data.tags) transactionData.tags = data.tags;
      if (data.location) transactionData.location = data.location;

      const { data: insertedData, error } = await supabase
        .from(this.tableName)
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return insertedData as Transaction;
    } catch (error: any) {
      console.error("Erro ao criar transação:", error);
      throw new Error(`Falha ao criar transação: ${error.message}`);
    }
  }

  /**
   * Busca transações com filtros opcionais
   */
  async findMany(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const supabase = SupabaseWrapper.get();
      let query = supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filters?.month_year) {
        query = query.eq("month_year", filters.month_year);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.is_credit_card !== undefined) {
        query = query.eq("is_credit_card", filters.is_credit_card);
      }

      // Limite e offset
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as Transaction[];
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      throw new Error(`Falha ao buscar transações: ${error.message}`);
    }
  }

  /**
   * Busca uma transação por ID
   */
  async findById(id: string): Promise<Transaction | null> {
    try {
      const supabase = SupabaseWrapper.get();
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Registro não encontrado
          return null;
        }
        throw new Error(error.message);
      }

      return data as Transaction;
    } catch (error: any) {
      console.error("Erro ao buscar transação:", error);
      throw new Error(`Falha ao buscar transação: ${error.message}`);
    }
  }

  /**
   * Atualiza uma transação
   */
  async update(id: string, data: UpdateTransactionDTO): Promise<Transaction> {
    try {
      const supabase = SupabaseWrapper.get();
      const updateData: Partial<Transaction> = { ...data };

      const { data: updatedData, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!updatedData) {
        throw new Error("Transação não encontrada após atualização");
      }

      return updatedData as Transaction;
    } catch (error: any) {
      console.error("Erro ao atualizar transação:", error);
      throw new Error(`Falha ao atualizar transação: ${error.message}`);
    }
  }

  /**
   * Deleta uma transação
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = SupabaseWrapper.get();
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Erro ao deletar transação:", error);
      throw new Error(`Falha ao deletar transação: ${error.message}`);
    }
  }

  /**
   * Formata data no formato YYYY-MM
   */
  private formatMonthYear(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
}

export default new TransactionService();
