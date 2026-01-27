import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

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

// ──────────────────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────────────────

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard Statistics ───────────────────────────────────────────────────

  /**
   * Get overall dashboard statistics.
   *
   * Returns aggregate metrics: total revenue, orders, customers, products,
   * along with growth percentages compared to the previous 30-day period.
   *
   * All monetary values are in BDT (৳).
   */
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      totalRevenue,
      previousRevenue,
      totalOrders,
      previousOrders,
      totalCustomers,
      previousCustomers,
      totalProducts,
      previousProducts,
      pendingOrders,
      processingOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Current period revenue (last 30 days)
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      }),
      // Previous period revenue (30-60 days ago)
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      }),
      // Current period orders
      this.prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      // Previous period orders
      this.prisma.order.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      // Current period new customers
      this.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo }, role: 'CUSTOMER' },
      }),
      // Previous period new customers
      this.prisma.user.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          role: 'CUSTOMER',
        },
      }),
      // Total active products
      this.prisma.product.count({
        where: { isActive: true },
      }),
      // Products added in previous period (for growth)
      this.prisma.product.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      // Pending orders
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),
      // Processing orders
      this.prisma.order.count({
        where: { status: 'PROCESSING' },
      }),
      // Low stock products (stock <= threshold)
      this.prisma.product.count({
        where: {
          isActive: true,
          stock: { lte: 10 },
        },
      }),
    ]);

    const currentRev = totalRevenue._sum.totalAmount?.toNumber() ?? 0;
    const prevRev = previousRevenue._sum.totalAmount?.toNumber() ?? 0;

    return {
      totalRevenue: currentRev,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueGrowth: this.calculateGrowth(currentRev, prevRev),
      ordersGrowth: this.calculateGrowth(totalOrders, previousOrders),
      customersGrowth: this.calculateGrowth(totalCustomers, previousCustomers),
      productsGrowth: this.calculateGrowth(totalProducts, previousProducts),
      pendingOrders,
      processingOrders,
      lowStockProducts,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Calculate percentage growth between two values.
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }
}
