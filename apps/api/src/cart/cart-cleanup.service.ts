import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Scheduled service for cleaning up expired and abandoned guest carts.
 *
 * Runs daily at 3:00 AM to remove:
 * - Guest carts older than 30 days
 * - Guest carts that have passed their explicit expiry date
 *
 * Authenticated user carts are preserved indefinitely.
 */
@Injectable()
export class CartCleanupService {
  private readonly logger = new Logger(CartCleanupService.name);

  /** Number of days after which guest carts are considered abandoned */
  private readonly GUEST_CART_TTL_DAYS = 30;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Daily cleanup of expired guest carts.
   *
   * Runs every day at 3:00 AM server time.
   * Only targets carts without a userId (guest carts) that are either:
   *   1. Older than 30 days (based on updatedAt)
   *   2. Past their explicit expiresAt timestamp
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCartCleanup(): Promise<void> {
    this.logger.log('Starting daily cart cleanup...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.GUEST_CART_TTL_DAYS);

    try {
      // First, delete all cart items belonging to expired guest carts
      const expiredCarts = await this.prisma.cart.findMany({
        where: {
          userId: null, // Only guest carts
          OR: [
            { updatedAt: { lt: cutoffDate } },
            { expiresAt: { lt: new Date() } },
          ],
        },
        select: { id: true },
      });

      if (expiredCarts.length === 0) {
        this.logger.log('No expired guest carts found. Cleanup complete.');
        return;
      }

      const cartIds = expiredCarts.map((cart) => cart.id);

      // Delete cart items first (referential integrity)
      const deletedItems = await this.prisma.cartItem.deleteMany({
        where: { cartId: { in: cartIds } },
      });

      // Delete the carts themselves
      const deletedCarts = await this.prisma.cart.deleteMany({
        where: { id: { in: cartIds } },
      });

      this.logger.log(
        `Cart cleanup complete: removed ${deletedCarts.count} expired guest carts ` +
          `and ${deletedItems.count} cart items`,
      );
    } catch (error) {
      this.logger.error('Cart cleanup failed', error);
    }
  }

  /**
   * Get statistics about current carts (for admin monitoring).
   */
  async getCartStats(): Promise<{
    totalCarts: number;
    guestCarts: number;
    userCarts: number;
    expiredGuestCarts: number;
    totalItems: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.GUEST_CART_TTL_DAYS);

    const [totalCarts, guestCarts, userCarts, expiredGuestCarts, totalItems] =
      await Promise.all([
        this.prisma.cart.count(),
        this.prisma.cart.count({ where: { userId: null } }),
        this.prisma.cart.count({ where: { userId: { not: null } } }),
        this.prisma.cart.count({
          where: {
            userId: null,
            OR: [
              { updatedAt: { lt: cutoffDate } },
              { expiresAt: { lt: new Date() } },
            ],
          },
        }),
        this.prisma.cartItem.count(),
      ]);

    return {
      totalCarts,
      guestCarts,
      userCarts,
      expiredGuestCarts,
      totalItems,
    };
  }
}
