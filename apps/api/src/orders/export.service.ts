import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';

interface ExportFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

@Injectable()
export class OrderExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportOrders(filters: ExportFilters): Promise<Readable> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { phone: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const batchSize = 100;
    let skip = 0;
    let hasMore = true;

    const csvStream = new Readable({
      read() {},
    });

    // CSV Header
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Status',
      'Payment Status',
      'Payment Method',
      'Subtotal (BDT)',
      'Shipping Cost (BDT)',
      'Tax (BDT)',
      'Discount (BDT)',
      'Coupon Code',
      'Total Amount (BDT)',
      'Shipping Method',
      'Tracking Number',
      'Shipping City',
      'Shipping Area',
      'Items Count',
      'Item Details',
    ];

    csvStream.push(headers.map(this.escapeCSV).join(',') + '\n');

    // Stream orders in batches
    const processNextBatch = async () => {
      while (hasMore) {
        const orders = await this.prisma.order.findMany({
          where,
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
            shippingAddress: true,
          },
          orderBy: { createdAt: 'desc' },
          take: batchSize,
          skip,
        });

        if (orders.length === 0) {
          hasMore = false;
          break;
        }

        for (const order of orders) {
          const itemDetails = order.items
            .map(
              (item: any) =>
                `${item.product?.name || item.productName || 'N/A'} x${item.quantity} @ ৳${Number(item.unitPrice).toFixed(2)}`,
            )
            .join('; ');

          const row = [
            order.orderNumber,
            new Date(order.createdAt).toISOString(),
            order.user?.name || 'N/A',
            order.user?.email || 'N/A',
            order.user?.phone || 'N/A',
            order.status,
            order.paymentStatus,
            order.paymentMethod,
            Number(order.subtotal).toFixed(2),
            Number(order.shippingCost).toFixed(2),
            Number(order.tax).toFixed(2),
            Number(order.discount).toFixed(2),
            order.couponCode || '',
            Number(order.totalAmount).toFixed(2),
            order.shippingMethod || '',
            order.trackingNumber || '',
            order.shippingAddress?.city || '',
            order.shippingAddress?.area || '',
            order.items.length.toString(),
            itemDetails,
          ];

          csvStream.push(row.map(this.escapeCSV).join(',') + '\n');
        }

        skip += batchSize;

        if (orders.length < batchSize) {
          hasMore = false;
        }
      }

      csvStream.push(null); // Signal end of stream
    };

    // Start processing asynchronously
    processNextBatch().catch((error) => {
      csvStream.destroy(error);
    });

    return csvStream;
  }

  private escapeCSV(value: string): string {
    if (value === null || value === undefined) {
      return '""';
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  async getOrderStats(filters: ExportFilters): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
    paymentBreakdown: Record<string, number>;
  }> {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [totalOrders, aggregate, statusGroups, paymentGroups] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['paymentStatus'],
        where,
        _count: true,
      }),
    ]);

    const statusBreakdown: Record<string, number> = {};
    for (const group of statusGroups) {
      statusBreakdown[group.status] = group._count;
    }

    const paymentBreakdown: Record<string, number> = {};
    for (const group of paymentGroups) {
      paymentBreakdown[group.paymentStatus] = group._count;
    }

    return {
      totalOrders,
      totalRevenue: Number(aggregate._sum.totalAmount) || 0,
      averageOrderValue: Number(aggregate._avg.totalAmount) || 0,
      statusBreakdown,
      paymentBreakdown,
    };
  }
}
