import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Cart summary with calculated totals.
 */
export interface CartSummary {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemWithProduct[];
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  couponCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct {
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
    images: any[];
    status: string;
  };
}

/**
 * Shopping cart service.
 *
 * Handles cart lifecycle management for both authenticated users and
 * anonymous guests. Guest carts are identified by a session ID and
 * can be merged into a user cart upon authentication.
 */
@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create a cart for the given user or guest session.
   *
   * If a user is authenticated, their cart is retrieved by userId.
   * If no cart exists, a new one is created. For guests, the cart
   * is identified by a sessionId.
   *
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns The active cart
   */
  async getOrCreateCart(userId?: string, sessionId?: string) {
    // Try to find existing cart
    let cart = await this.findCartRaw(userId, sessionId);

    if (cart) {
      return this.buildCartSummary(cart);
    }

    // Create new cart
    cart = await this.prisma.cart.create({
      data: {
        ...(userId ? { userId } : {}),
        ...(sessionId ? { sessionId } : {}),
        expiresAt: this.getCartExpiry(),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                sku: true,
                stock: true,
                images: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    this.logger.debug(
      `Created new cart: ${cart.id} for ${userId ? `user ${userId}` : `guest ${sessionId}`}`,
    );

    return this.buildCartSummary(cart);
  }

  /**
   * Get the cart with full details and calculated totals.
   *
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Cart summary with subtotal, discount, total, and item count
   */
  async getCart(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.findCartRaw(userId, sessionId);

    if (!cart) {
      // Return an empty cart summary
      return this.getOrCreateCart(userId, sessionId);
    }

    return this.buildCartSummary(cart);
  }

  /**
   * Merge a guest cart into an authenticated user's cart.
   *
   * When a guest user logs in, their anonymous cart items are moved
   * into their authenticated cart. If an item already exists in the
   * user cart, quantities are summed. The guest cart is then deleted.
   *
   * @param userId - The authenticated user's ID
   * @param sessionId - The guest session ID to merge from
   * @returns The merged user cart
   */
  async mergeGuestCart(userId: string, sessionId: string): Promise<CartSummary> {
    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId, userId: null },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    // Get or create user cart (raw for internal use)
    const userCartSummary = await this.getOrCreateCart(userId);
    const userCartId = userCartSummary.id;

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCartId,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
        },
      });

      if (existingItem) {
        // Sum quantities for existing items
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + guestItem.quantity },
        });
      } else {
        // Move new items to user cart
        await this.prisma.cartItem.create({
          data: {
            cartId: userCartId,
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            price: guestItem.price,
          },
        });
      }
    }

    // Delete guest cart
    await this.prisma.cart.delete({ where: { id: guestCart.id } });

    this.logger.log(
      `Merged guest cart ${guestCart.id} (${guestCart.items.length} items) into user cart ${userCartId}`,
    );

    // Return updated cart with totals
    return this.getCartByIdSummary(userCartId);
  }

  /**
   * Get a cart by ID with calculated totals.
   */
  async getCartByIdSummary(cartId: string): Promise<CartSummary> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                sku: true,
                stock: true,
                images: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.buildCartSummary(cart);
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Find a cart (raw Prisma result) by user ID or session ID.
   */
  private async findCartRaw(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) return null;

    return this.prisma.cart.findFirst({
      where: {
        ...(userId ? { userId } : { sessionId, userId: null }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                sku: true,
                stock: true,
                images: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Build a cart summary with calculated totals from a raw cart.
   */
  private buildCartSummary(cart: any): CartSummary {
    const items: CartItemWithProduct[] = (cart.items || []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.price),
      lineTotal: Number(item.price) * item.quantity,
      product: item.product,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = Number(cart.discount || 0);
    const total = Math.max(0, subtotal - discount);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items,
      subtotal,
      discount,
      total,
      itemCount,
      couponCode: cart.couponCode || null,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Calculate expiry date for guest carts (30 days from now).
   */
  private getCartExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    return expiry;
  }
}
