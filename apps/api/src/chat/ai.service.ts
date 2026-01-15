import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, type Content, type FunctionDeclaration } from '@google/genai';

import { ProductContextService } from './product-context.service';
import type { ChatProductCard, ChatResponse } from './types/chat.types';

const SYSTEM_PROMPT = `You are a helpful shopping assistant for an e-commerce store. You help customers find products, compare options, check availability, and answer questions about products.

Rules:
- Only discuss products and shopping-related topics
- Use the provided tools to look up real product data — never fabricate product names, prices, or details
- When showing products, always include the slug so the frontend can link to them
- Prices are in BDT (Bangladeshi Taka, symbol ৳)
- Be concise and friendly — keep responses under 150 words unless comparing products
- If a user asks something unrelated to shopping, politely redirect them
- When comparing products, present information in a structured way
- If a product is out of stock, mention it clearly
- After responding, suggest 2-3 brief follow-up questions the user might ask`;

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'search_products',
    description:
      'Search for products by keyword, category, brand, price range, or other filters',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' },
        categorySlug: {
          type: 'string',
          description: 'Category slug to filter by',
        },
        brandSlug: {
          type: 'string',
          description: 'Brand slug to filter by',
        },
        minPrice: { type: 'number', description: 'Minimum price in BDT' },
        maxPrice: { type: 'number', description: 'Maximum price in BDT' },
        isFeatured: {
          type: 'boolean',
          description: 'Only show featured products',
        },
        sortBy: {
          type: 'string',
          enum: ['price', 'createdAt', 'averageRating', 'name'],
          description: 'Field to sort by',
        },
        sortOrder: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Sort direction',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 5)',
        },
      },
    },
  },
  {
    name: 'get_product_details',
    description:
      'Get full details of a specific product including variants, images, reviews, and availability',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Product slug identifier' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_categories',
    description:
      'List all product categories with their hierarchy and product counts',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'compare_products',
    description: 'Compare two or more products side by side by their slugs',
    parameters: {
      type: 'object',
      properties: {
        slugs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of product slugs to compare',
        },
      },
      required: ['slugs'],
    },
  },
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly productContext: ProductContextService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
    this.model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
  }

  async chat(
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
  ): Promise<ChatResponse> {
    // Build contents array (Gemini uses 'model' instead of 'assistant')
    const contents: Content[] = [
      ...history.slice(-10).map(
        (m) =>
          ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }) as Content,
      ),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    let collectedProducts: ChatProductCard[] = [];

    // First call — may trigger function calls
    const firstResponse = await this.ai.models.generateContent({
      model: this.model,
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    });

    const functionCalls = firstResponse.functionCalls;

    // If no function calls, return direct response
    if (!functionCalls || functionCalls.length === 0) {
      return {
        message: firstResponse.text || 'How can I help you?',
        products: [],
        suggestedQuestions: this.extractSuggestions(
          firstResponse.text || '',
        ),
      };
    }

    // Push the model's response (with function call parts) into conversation
    contents.push({
      role: 'model',
      parts: firstResponse.candidates?.[0]?.content?.parts || [],
    });

    // Execute each function call and build function response parts
    const functionResponseParts: Array<{
      functionResponse: { name: string; response: { content: unknown } };
    }> = [];

    for (const fc of functionCalls) {
      const args = (fc.args || {}) as Record<string, unknown>;
      let toolResult: unknown;

      try {
        switch (fc.name) {
          case 'search_products': {
            const result = await this.productContext.searchProducts(args as any);
            collectedProducts = [...collectedProducts, ...result.products];
            toolResult = { total: result.total, products: result.products };
            break;
          }

          case 'get_product_details': {
            const product = await this.productContext.getProductDetails(
              args.slug as string,
            );
            if (product) {
              collectedProducts.push(product);
              toolResult = product;
            } else {
              toolResult = { error: 'Product not found' };
            }
            break;
          }

          case 'list_categories': {
            toolResult = await this.productContext.listCategories();
            break;
          }

          case 'compare_products': {
            const products = await this.productContext.compareProducts(
              args.slugs as string[],
            );
            collectedProducts = [...collectedProducts, ...products];
            toolResult = products;
            break;
          }

          default:
            toolResult = { error: 'Unknown tool' };
        }
      } catch (error) {
        this.logger.error(`Tool call ${fc.name} failed:`, error);
        toolResult = { error: 'Failed to fetch data' };
      }

      functionResponseParts.push({
        functionResponse: {
          name: fc.name!,
          response: { content: toolResult },
        },
      });
    }

    // Push all function responses as a single user-role message
    contents.push({
      role: 'user',
      parts: functionResponseParts,
    } as Content);

    // Second call — generate natural language response from tool results
    const secondResponse = await this.ai.models.generateContent({
      model: this.model,
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const responseText = secondResponse.text || 'Here are the results.';

    // Deduplicate products by slug
    const uniqueProducts = this.deduplicateProducts(collectedProducts);

    return {
      message: responseText,
      products: uniqueProducts,
      suggestedQuestions: this.extractSuggestions(responseText),
    };
  }

  private deduplicateProducts(products: ChatProductCard[]): ChatProductCard[] {
    const seen = new Set<string>();
    return products.filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
  }

  private extractSuggestions(text: string): string[] {
    // Try to extract question-like sentences from the response
    const lines = text.split('\n');
    const suggestions: string[] = [];

    for (const line of lines) {
      const trimmed = line.replace(/^[-•*\d.)\s]+/, '').trim();
      if (
        trimmed.endsWith('?') &&
        trimmed.length > 10 &&
        trimmed.length < 80
      ) {
        suggestions.push(trimmed);
      }
    }

    return suggestions.slice(0, 3);
  }
}
