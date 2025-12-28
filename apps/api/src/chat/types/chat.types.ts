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
