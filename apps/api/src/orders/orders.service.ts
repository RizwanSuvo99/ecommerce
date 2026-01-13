import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Order number format: ORD-YYYYMMDD-XXXX
 *
 * - ORD: fixed prefix for easy identification
 * - YYYYMMDD: date the order was placed
 * - XXXX: zero-padded daily sequential counter (0001-9999)
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Order Number Generator ─────────────────────────────────────────────────

  /**
   * Generate a unique order number in ORD-YYYYMMDD-XXXX format.
   *
   * The sequence counter resets daily. Each call atomically increments
   * the counter for the current date to avoid duplicates under
   * concurrent load.
   *
   * @returns A unique order number string, e.g. "ORD-20260113-0042"
   */
  async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Count orders placed today to determine the next sequence number
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const sequence = String(todayCount + 1).padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${sequence}`;

    this.logger.debug(`Generated order number: ${orderNumber}`);

    return orderNumber;
  }
}
