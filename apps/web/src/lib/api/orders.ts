import { apiClient } from './client';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  totalFormatted: string;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  totalSpentFormatted: string;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ──────────────────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────────────────

export async function getOrderHistory(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ orders: Order[]; pagination: OrderPagination }> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);

  const response = await apiClient.get<{
    success: boolean;
    data: Order[];
    pagination: OrderPagination;
  }>(`/users/orders?${searchParams.toString()}`);

  return {
    orders: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await apiClient.get<{
    success: boolean;
    data: OrderStats;
  }>('/users/orders/stats');

  return response.data.data;
}

/**
 * Format BDT amount with ৳ symbol.
 */
export function formatOrderAmount(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

/**
 * Get a human-readable status label.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  return labels[status] || status;
}
