import { apiClient } from './client';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  pendingOrders: number;
  processingOrders: number;
  lowStockProducts: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

export interface ChartsData {
  revenueOverTime: ChartDataPoint[];
  topProducts: TopProduct[];
  revenueByCategory: CategoryRevenue[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export interface RecentRegistration {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LowStockAlert {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  image: string | null;
}

export interface ActivityData {
  recentOrders: RecentOrder[];
  recentRegistrations: RecentRegistration[];
  lowStockAlerts: LowStockAlert[];
}

// ──────────────────────────────────────────────────────────
// Dashboard API
// ──────────────────────────────────────────────────────────

/**
 * Fetch admin dashboard statistics.
 * All monetary values are in BDT (৳).
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get('/admin/dashboard/stats');
  return data.data;
}

/**
 * Fetch chart data for the admin dashboard.
 */
export async function fetchDashboardCharts(): Promise<ChartsData> {
  const { data } = await apiClient.get('/admin/dashboard/charts');
  return data.data;
}

/**
 * Fetch recent activity data for the admin dashboard.
 */
export async function fetchDashboardActivity(): Promise<ActivityData> {
  const { data } = await apiClient.get('/admin/dashboard/activity');
  return data.data;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

/**
 * Format a number as BDT currency.
 *
 * @example formatBDT(15000) → "৳15,000"
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}
