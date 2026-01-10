import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    let cart = await this.findCart(userId, sessionId);

    if (cart) {
      return cart;
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

    return cart;
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
  async mergeGuestCart(userId: string, sessionId: string) {
    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId, userId: null },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCart(userId);

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
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
            cartId: userCart.id,
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
      `Merged guest cart ${guestCart.id} (${guestCart.items.length} items) into user cart ${userCart.id}`,
    );

    // Return updated cart
    return this.getCartById(userCart.id);
  }

  /**
   * Find a cart by user ID or session ID.
   */
  async findCart(userId?: string, sessionId?: string) {
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
   * Get a cart by its ID with full item details.
   */
  async getCartById(cartId: string) {
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

    return cart;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Calculate expiry date for guest carts (30 days from now).
   */
  private getCartExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    return expiry;
  }
}
