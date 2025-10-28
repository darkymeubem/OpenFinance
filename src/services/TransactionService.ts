import { db } from "../config/firebase";
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from "../types/Transaction";

export class TransactionService {
  private readonly collectionName = "transactions";

  /**
   * Cria uma nova transação no Firebase
   */
  async create(data: CreateTransactionDTO): Promise<Transaction> {
    try {
      const now = new Date();
      const month_year = data.month_year || this.formatMonthYear(now);

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

      const docRef = await db
        .collection(this.collectionName)
        .add(transactionData);

      return {
        id: docRef.id,
        ...transactionData,
      };
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
      let query = db
        .collection(this.collectionName)
        .orderBy("created_at", "desc");

      // Aplicar filtros
      if (filters?.month_year) {
        query = query.where("month_year", "==", filters.month_year);
      }
      if (filters?.category) {
        query = query.where("category", "==", filters.category);
      }
      if (filters?.is_credit_card !== undefined) {
        query = query.where("is_credit_card", "==", filters.is_credit_card);
      }

      // Limite e offset
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
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
      const doc = await db.collection(this.collectionName).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as Transaction;
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
      const updateData: Partial<Transaction> = { ...data };

      await db.collection(this.collectionName).doc(id).update(updateData);

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error("Transação não encontrada após atualização");
      }

      return updated;
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
      await db.collection(this.collectionName).doc(id).delete();
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
