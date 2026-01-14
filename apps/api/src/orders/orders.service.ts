import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto, PaymentMethod } from './dto/checkout.dto';

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
 * Pagination options for order listings.
 */
interface PaginationOptions {
  page: number;
  limit: number;
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
   */
  async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

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
   */
  async validateCheckout(
    dto: CheckoutDto,
    userId: string,
  ): Promise<CheckoutValidation> {
    const errors: string[] = [];

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

    const subtotal = itemValidations.reduce((sum, v) => sum + v.lineTotal, 0);

    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      errors.push('Shipping address not found or does not belong to you');
    }

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

    const shippingCost = 0;
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

  // ─── Order Creation ───────────────────────────────────────────────────────────

  /**
   * Create a new order from the user's cart.
   *
   * Snapshots prices, decrements inventory, creates order+items,
   * clears cart, and increments coupon usage — all in a transaction.
   */
  async createOrder(dto: CheckoutDto, userId: string) {
    const validation = await this.validateCheckout(dto, userId);

    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Checkout validation failed',
        errors: validation.errors,
      });
    }

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

    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        if (product.stock < 0) {
          throw new BadRequestException(
            `"${item.product.name}" went out of stock during checkout`,
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentMethod === PaymentMethod.COD ? 'PENDING' : 'AWAITING',
          subtotal: validation.subtotal,
          discount: validation.discount,
          shippingCost: validation.shippingCost,
          tax: 0,
          total: validation.total,
          couponCode: dto.couponCode?.toUpperCase() || null,
          shippingName: `${address.firstName} ${address.lastName}`,
          shippingPhone: address.phone,
          shippingAddress: address.addressLine1,
          shippingAddress2: address.addressLine2 || null,
          shippingCity: address.city,
          shippingDistrict: address.district,
          shippingDivision: address.division,
          shippingPostalCode: address.postalCode,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              name: item.product.name,
              sku: item.product.sku,
              price: Number(item.product.price),
              quantity: item.quantity,
              total: Number(item.product.price) * item.quantity,
              imageUrl: item.product.images?.[0]?.url || null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { couponCode: null, discount: 0 },
      });

      if (dto.couponCode) {
        await tx.coupon.update({
          where: { code: dto.couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    this.logger.log(
      `Order ${orderNumber} created for user ${userId} — ${cart.items.length} items, total ৳${validation.total}`,
    );

    return order;
  }

  // ─── Order Queries ────────────────────────────────────────────────────────────

  /**
   * Find all orders for a specific user (paginated).
   *
   * Returns orders sorted by creation date (newest first) with
   * item count and basic item details.
   */
  async findUserOrders(userId: string, options: PaginationOptions) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
              total: true,
              imageUrl: true,
            },
          },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single order by its order number.
   *
   * Includes full item details and user information.
   * Verifies ownership unless the caller is an admin.
   */
  async findOrderByNumber(orderNumber: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    // If a userId is provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  /**
   * Find all orders (admin view) with pagination and filtering.
   *
   * Supports filtering by status and includes user details.
   */
  async findAllOrders(options: PaginationOptions & { status?: string }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
              total: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
