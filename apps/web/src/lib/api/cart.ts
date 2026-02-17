import { apiClient } from './client';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    sku: string;
    stock: number;
    images: Array<{ url: string; alt?: string }>;
    status: string;
  };
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  couponCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddCartItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface ApplyCouponPayload {
  code: string;
}

// ──────────────────────────────────────────────────────────
// Session ID management
// ──────────────────────────────────────────────────────────

const SESSION_ID_KEY = 'cart_session_id';

/**
 * Get or create a persistent session ID for guest cart tracking.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear the session ID (e.g., after cart merge on login).
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ID_KEY);
  }
}

/**
 * Get headers with session ID for guest cart requests.
 */
function sessionHeaders(): Record<string, string> {
  const sessionId = getSessionId();
  return sessionId ? { 'X-Session-Id': sessionId } : {};
}

// ──────────────────────────────────────────────────────────
// Cart API functions
// ──────────────────────────────────────────────────────────

/**
 * Fetch the current cart.
 */
export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart', {
    headers: sessionHeaders(),
  });
  return data;
}

/**
 * Add an item to the cart.
 */
export async function addCartItem(payload: AddCartItemPayload): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/cart/items', payload, {
    headers: sessionHeaders(),
  });
  return data;
}

/**
 * Update the quantity of a cart item.
 */
export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload,
): Promise<Cart> {
  const { data } = await apiClient.patch<Cart>(
    `/cart/items/${itemId}`,
    payload,
    { headers: sessionHeaders() },
  );
  return data;
}

/**
 * Remove an item from the cart.
 */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>(
    `/cart/items/${itemId}`,
    { headers: sessionHeaders() },
  );
  return data;
}

/**
 * Clear all items from the cart.
 */
export async function clearCart(): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>('/cart/items', {
    headers: sessionHeaders(),
  });
  return data;
}

/**
 * Apply a coupon code to the cart.
 */
export async function applyCoupon(payload: ApplyCouponPayload): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/cart/coupon', payload, {
    headers: sessionHeaders(),
  });
  return data;
}

/**
 * Remove the applied coupon from the cart.
 */
export async function removeCoupon(): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>('/cart/coupon', {
    headers: sessionHeaders(),
  });
  return data;
}

/**
 * Merge a guest cart into the authenticated user's cart (called after login).
 */
export async function mergeCart(): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/cart/merge', null, {
    headers: sessionHeaders(),
  });
  return data;
}
