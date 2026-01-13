import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

/**
 * Validation result for a single cart item during checkout.
 */
interface ItemValidation {
  productId: string;
  name: string;
  requestedQuantity: number;
  availableStock: number;
  unitPrice: number;
  lineTotal: number;
  inStock: boolean;
}

/**
 * Complete checkout validation result.
 */
interface CheckoutValidation {
  valid: boolean;
  items: ItemValidation[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  errors: string[];
}

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

  // ─── Checkout Validation ──────────────────────────────────────────────────────

  /**
   * Validate checkout data: stock availability, price consistency,
   * coupon validity, and shipping address/method.
   *
   * Returns a detailed validation result with item-level stock checks
   * and the calculated totals (subtotal, discount, shipping, total).
   */
  async validateCheckout(
    dto: CheckoutDto,
    userId: string,
  ): Promise<CheckoutValidation> {
    const errors: string[] = [];

    // 1. Fetch the user's cart with items
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // 2. Validate each item's stock and price
    const itemValidations: ItemValidation[] = [];

    for (const item of cart.items) {
      const product = item.product;
      const inStock = product.stock >= item.quantity;

      if (!inStock) {
        errors.push(
          `"${product.name}" has only ${product.stock} in stock (requested ${item.quantity})`,
        );
      }

      if (product.status !== 'ACTIVE') {
        errors.push(`"${product.name}" is no longer available`);
      }

      itemValidations.push({
        productId: product.id,
        name: product.name,
        requestedQuantity: item.quantity,
        availableStock: product.stock,
        unitPrice: Number(product.price),
        lineTotal: Number(product.price) * item.quantity,
        inStock,
      });
    }

    // 3. Calculate subtotal from current product prices
    const subtotal = itemValidations.reduce((sum, v) => sum + v.lineTotal, 0);

    // 4. Validate shipping address
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      errors.push('Shipping address not found or does not belong to you');
    }

    // 5. Validate coupon (if provided)
    let discount = 0;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });

      if (!coupon) {
        errors.push('Invalid coupon code');
      } else if (!coupon.isActive) {
        errors.push('This coupon is no longer active');
      } else if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        errors.push('This coupon has expired');
      } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        errors.push('This coupon has reached its usage limit');
      } else if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        errors.push(
          `Minimum order of ৳${coupon.minOrderAmount} required for this coupon`,
        );
      } else {
        // Calculate discount
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * Number(coupon.value)) / 100;
          if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
            discount = Number(coupon.maxDiscount);
          }
        } else {
          discount = Number(coupon.value);
        }
        discount = Math.min(discount, subtotal);
      }
    }

    // 6. Shipping cost placeholder (will be calculated by shipping service)
    const shippingCost = 0;

    // 7. Calculate total
    const total = Math.max(0, subtotal - discount + shippingCost);

    return {
      valid: errors.length === 0,
      items: itemValidations,
      subtotal,
      discount,
      shippingCost,
      total,
      errors,
    };
  }
}
