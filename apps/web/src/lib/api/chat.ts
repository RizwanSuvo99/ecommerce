import { apiClient } from './client';

export interface ChatProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  category: string;
  brand: string | null;
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  shortDescription: string | null;
}

export interface ChatResponse {
  message: string;
  products: ChatProductCard[];
  suggestedQuestions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProductCard[];
  suggestedQuestions?: string[];
  timestamp: number;
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<ChatResponse> {
  const { data } = await apiClient.post('/chat', {
    message,
    history: history.slice(-10),
  }, { timeout: 60_000 });

  const result = data?.data ?? data;
  return result as ChatResponse;
}
