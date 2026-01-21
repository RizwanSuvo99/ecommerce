import { apiClient } from './client';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  orderId: string;
  items: Array<{
    name: string;
    description?: string;
    image?: string;
    quantity: number;
    priceBDT: number;
  }>;
  shippingCostBDT?: number;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
  totalBDT: number;
  totalFormatted: string;
  totalUSDCents: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  method: 'STRIPE' | 'COD';
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CODPaymentResponse {
  paymentId: string;
  method: 'COD';
  amountBDT: number;
  amountFormatted: string;
  status: string;
  message: string;
}

// ──────────────────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session and return the session URL
 * for redirecting the user to Stripe's hosted checkout page.
 */
export async function createStripeCheckoutSession(
  data: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const response = await apiClient.post<{ success: boolean; data: CheckoutSessionResponse }>(
    '/payment/stripe/create-session',
    data,
  );
  return response.data.data;
}

/**
 * Redirect the user to Stripe Checkout.
 * This opens Stripe's hosted payment page in the current window.
 */
export async function redirectToStripeCheckout(
  data: CheckoutSessionRequest,
): Promise<void> {
  const session = await createStripeCheckoutSession(data);

  if (session.sessionUrl) {
    window.location.href = session.sessionUrl;
  } else {
    throw new Error('Failed to create Stripe checkout session — no URL returned');
  }
}

/**
 * Create a Cash on Delivery payment record.
 */
export async function createCODPayment(
  orderId: string,
  amountBDT: number,
): Promise<CODPaymentResponse> {
  const response = await apiClient.post<{ success: boolean; data: CODPaymentResponse }>(
    '/payment/cod/create',
    { orderId, amountBDT },
  );
  return response.data.data;
}

/**
 * Get payment details for a specific order.
 */
export async function getPaymentByOrder(
  orderId: string,
): Promise<PaymentRecord> {
  const response = await apiClient.get<{ success: boolean; data: PaymentRecord }>(
    `/payment/order/${orderId}`,
  );
  return response.data.data;
}

/**
 * Format BDT currency amount with ৳ symbol.
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}
