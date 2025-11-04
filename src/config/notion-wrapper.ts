import { Client } from "@notionhq/client";

/**
 * Wrapper para gerenciar a conexão com o Notion API
 * Implementa padrão Singleton para garantir única instância
 */
export class NotionWrapper {
  private static instance: Client | null = null;

  /**
   * Inicializa o cliente do Notion com as credenciais do .env
   */
  static init(): void {
    const notionToken = process.env.NOTION_TOKEN;

    if (!notionToken) {
      throw new Error(
        "NOTION_TOKEN não está configurado nas variáveis de ambiente"
      );
    }

    this.instance = new Client({
      auth: notionToken,
    });

    console.log("✅ Cliente Notion inicializado com sucesso");
  }

  /**
   * Retorna a instância do cliente Notion
   * @throws {Error} Se o cliente não foi inicializado
   */
  static get(): Client {
    if (!this.instance) {
      throw new Error(
        "Cliente Notion não inicializado. Chame NotionWrapper.init() primeiro."
      );
    }
    return this.instance;
  }

  /**
   * Verifica se o cliente foi inicializado
   */
  static isInitialized(): boolean {
    return this.instance !== null;
  }
}
