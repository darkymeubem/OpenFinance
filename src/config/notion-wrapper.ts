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

    // Validar formato do token
    // Nota: A partir de setembro/2024, a Notion usa prefixo 'ntn_' para tokens novos
    if (!notionToken.startsWith("secret_") && !notionToken.startsWith("ntn_")) {
      throw new Error(
        `NOTION_TOKEN inválido: deve começar com 'secret_' ou 'ntn_' mas começa com '${notionToken.substring(
          0,
          7
        )}'. ` +
          "Acesse https://www.notion.so/my-integrations e copie o 'Internal Integration Token'"
      );
    }

    if (notionToken.startsWith("ntn_")) {
      console.log(
        "✅ Token com formato novo (ntn_) - padrão desde setembro/2024"
      );
    }

    this.instance = new Client({
      auth: notionToken,
      notionVersion: "2025-09-03", // Versão da API do Notion
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
