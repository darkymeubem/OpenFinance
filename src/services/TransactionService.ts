import { SupabaseWrapper } from "../config/supabase-wrapper";
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from "../types/Transaction";
import notionService from "./NotionService";

export class TransactionService {
  private readonly tableName = "transactions";

  /**
   * Cria uma nova transação no Supabase e sincroniza com o Notion
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

      // 1. Salvar no Supabase
      const { data: insertedData, error } = await supabase
        .from(this.tableName)
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const transaction = insertedData as Transaction;

      // 2. Sincronizar com o Notion
      try {
        const notionPageId = await notionService.createTransaction(transaction);

        // 3. Atualizar o Supabase com o ID da página do Notion
        const { data: updatedData, error: updateError } = await supabase
          .from(this.tableName)
          .update({ notion_page_id: notionPageId })
          .eq("id", transaction.id)
          .select()
          .single();

        if (updateError) {
          console.error(
            "⚠️ Erro ao atualizar notion_page_id no Supabase:",
            updateError
          );
        } else {
          transaction.notion_page_id = notionPageId;
        }

        console.log("✅ Transação salva no Supabase e Notion");
      } catch (notionError: any) {
        console.error(
          "⚠️ Erro ao sincronizar com o Notion:",
          notionError.message
        );
        console.log("ℹ️ Transação salva apenas no Supabase");
        // Não lançar erro - a transação foi salva no Supabase
      }

      return transaction;
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
   * Atualiza uma transação no Supabase e sincroniza com o Notion
   */
  async update(id: string, data: UpdateTransactionDTO): Promise<Transaction> {
    try {
      const supabase = SupabaseWrapper.get();
      const updateData: Partial<Transaction> = { ...data };

      // 1. Atualizar no Supabase
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

      const transaction = updatedData as Transaction;

      // 2. Sincronizar com o Notion (se houver notion_page_id)
      if (transaction.notion_page_id) {
        try {
          await notionService.updateTransaction(
            transaction.notion_page_id,
            transaction
          );
          console.log("✅ Transação atualizada no Supabase e Notion");
        } catch (notionError: any) {
          console.error("⚠️ Erro ao atualizar no Notion:", notionError.message);
          console.log("ℹ️ Transação atualizada apenas no Supabase");
          // Não lançar erro - a transação foi atualizada no Supabase
        }
      } else {
        console.log(
          "ℹ️ Transação não possui notion_page_id, pulando sincronização"
        );
      }

      return transaction;
    } catch (error: any) {
      console.error("Erro ao atualizar transação:", error);
      throw new Error(`Falha ao atualizar transação: ${error.message}`);
    }
  }

  /**
   * Deleta uma transação do Supabase e arquiva no Notion
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = SupabaseWrapper.get();

      // 1. Buscar a transação para obter o notion_page_id
      const transaction = await this.findById(id);

      // 2. Deletar do Supabase
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      // 3. Arquivar no Notion (se houver notion_page_id)
      if (transaction?.notion_page_id) {
        try {
          await notionService.deleteTransaction(transaction.notion_page_id);
          console.log("✅ Transação deletada do Supabase e arquivada no Notion");
        } catch (notionError: any) {
          console.error("⚠️ Erro ao arquivar no Notion:", notionError.message);
          console.log("ℹ️ Transação deletada apenas do Supabase");
          // Não lançar erro - a transação foi deletada do Supabase
        }
      } else {
        console.log("ℹ️ Transação não possui notion_page_id, pulando arquivamento");
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
