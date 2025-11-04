import { NotionWrapper } from "../config/notion-wrapper";
import { Transaction } from "../types/Transaction";

/**
 * Serviço para integração com o Notion
 * Mapeia transações para páginas no database do Notion
 */
export class NotionService {
  /**
   * Obtém o Database ID das variáveis de ambiente
   */
  private getDatabaseId(): string | undefined {
    return process.env.NOTION_DATABASE_ID;
  }

  /**
   * Verifica se o Notion está configurado
   */
  private isConfigured(): boolean {
    const hasToken = !!process.env.NOTION_TOKEN;
    const databaseId = this.getDatabaseId();
    const hasDatabaseId = !!databaseId;
    const tokenIsValid =
      hasToken &&
      (process.env.NOTION_TOKEN!.startsWith("secret_") ||
        process.env.NOTION_TOKEN!.startsWith("ntn_"));

    return hasDatabaseId && tokenIsValid;
  }

  /**
   * Lança erro se o Notion não estiver configurado
   */
  private ensureConfigured(): void {
    const databaseId = this.getDatabaseId();
    if (!databaseId) {
      throw new Error(
        "NOTION_DATABASE_ID não está configurado nas variáveis de ambiente"
      );
    }
    if (!process.env.NOTION_TOKEN) {
      throw new Error(
        "NOTION_TOKEN não está configurado nas variáveis de ambiente"
      );
    }
  }

  /**
   * Cria uma nova página no Notion representando uma transação
   * @param transaction - Dados da transação
   * @returns ID da página criada no Notion
   */
  async createTransaction(transaction: Transaction): Promise<string> {
    this.ensureConfigured();

    try {
      const notion = NotionWrapper.get();

      const properties: any = {
        // Descrição (Title)
        Descrição: {
          title: [
            {
              text: {
                content: transaction.description,
              },
            },
          ],
        },

        // Valor (Number)
        Valor: {
          number: transaction.amount,
        },

        // MesAno (Text)
        MesAno: {
          rich_text: [
            {
              text: {
                content: transaction.month_year,
              },
            },
          ],
        },

        // IsCreditCard (Checkbox)
        IsCreditCard: {
          checkbox: transaction.is_credit_card,
        },

        // Criado (Date)
        Criado: {
          date: {
            start: new Date(transaction.created_at).toISOString(),
          },
        },

        // Atualizado (Date) - inicialmente igual ao criado
        Atualizado: {
          date: {
            start: new Date(transaction.created_at).toISOString(),
          },
        },
      };

      // Categoria (Text) - opcional
      if (transaction.category) {
        properties.Categoria = {
          rich_text: [
            {
              text: {
                content: transaction.category,
              },
            },
          ],
        };
      }

      // Tags (Multi-select) - opcional
      if (transaction.tags && transaction.tags.length > 0) {
        properties.Tags = {
          multi_select: transaction.tags.map((tag) => ({ name: tag })),
        };
      }

      // Localização (Text) - opcional
      if (transaction.location) {
        const locationText =
          transaction.location.address ||
          `${transaction.location.latitude}, ${transaction.location.longitude}`;

        properties.Localização = {
          rich_text: [
            {
              text: {
                content: locationText,
              },
            },
          ],
        };
      }

      const response = await notion.pages.create({
        parent: {
          database_id: this.getDatabaseId()!,
        },
        properties,
      });

      console.log("✅ Transação criada no Notion:", response.id);
      return response.id;
    } catch (error: any) {
      console.error("❌ Erro ao criar transação no Notion:", error);
      throw new Error(`Falha ao criar página no Notion: ${error.message}`);
    }
  }

  /**
   * Atualiza uma página existente no Notion
   * @param notionPageId - ID da página no Notion
   * @param transaction - Dados atualizados da transação
   */
  async updateTransaction(
    notionPageId: string,
    transaction: Partial<Transaction>
  ): Promise<void> {
    this.ensureConfigured();

    try {
      const notion = NotionWrapper.get();

      const properties: any = {
        // Atualizado (Date) - sempre atualiza
        Atualizado: {
          date: {
            start: new Date().toISOString(),
          },
        },
      };

      // Descrição (Title)
      if (transaction.description !== undefined) {
        properties.Descrição = {
          title: [
            {
              text: {
                content: transaction.description,
              },
            },
          ],
        };
      }

      // Valor (Number)
      if (transaction.amount !== undefined) {
        properties.Valor = {
          number: transaction.amount,
        };
      }

      // MesAno (Text)
      if (transaction.month_year !== undefined) {
        properties.MesAno = {
          rich_text: [
            {
              text: {
                content: transaction.month_year,
              },
            },
          ],
        };
      }

      // IsCreditCard (Checkbox)
      if (transaction.is_credit_card !== undefined) {
        properties.IsCreditCard = {
          checkbox: transaction.is_credit_card,
        };
      }

      // Categoria (Text)
      if (transaction.category !== undefined) {
        properties.Categoria = {
          rich_text: [
            {
              text: {
                content: transaction.category,
              },
            },
          ],
        };
      }

      // Tags (Multi-select)
      if (transaction.tags !== undefined) {
        properties.Tags = {
          multi_select: transaction.tags.map((tag) => ({ name: tag })),
        };
      }

      // Localização (Text)
      if (transaction.location !== undefined) {
        const locationText =
          transaction.location.address ||
          `${transaction.location.latitude}, ${transaction.location.longitude}`;

        properties.Localização = {
          rich_text: [
            {
              text: {
                content: locationText,
              },
            },
          ],
        };
      }

      await notion.pages.update({
        page_id: notionPageId,
        properties,
      });

      console.log("✅ Transação atualizada no Notion:", notionPageId);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar transação no Notion:", error);
      throw new Error(`Falha ao atualizar página no Notion: ${error.message}`);
    }
  }

  /**
   * Deleta uma página do Notion (arquiva a página)
   * @param notionPageId - ID da página no Notion
   */
  async deleteTransaction(notionPageId: string): Promise<void> {
    this.ensureConfigured();

    try {
      const notion = NotionWrapper.get();

      await notion.pages.update({
        page_id: notionPageId,
        archived: true,
      });

      console.log("✅ Transação arquivada no Notion:", notionPageId);
    } catch (error: any) {
      console.error("❌ Erro ao arquivar transação no Notion:", error);
      throw new Error(`Falha ao arquivar página no Notion: ${error.message}`);
    }
  }

  /**
   * Testa a conexão com o Notion e verifica se o database existe
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error("❌ Notion não está configurado");
      return false;
    }

    try {
      const notion = NotionWrapper.get();
      const databaseId = this.getDatabaseId();

      const response = await notion.databases.retrieve({
        database_id: databaseId!,
      });

      console.log("✅ Conexão com Notion estabelecida - Database acessível");
      return true;
    } catch (error: any) {
      console.error("❌ Erro ao conectar com o Notion:");
      console.error("   Status:", error.status);
      console.error("   Code:", error.code);
      console.error("   Message:", error.message);

      // Re-lançar o erro para que possamos capturá-lo na rota
      throw error;
    }
  }
}

export default new NotionService();
