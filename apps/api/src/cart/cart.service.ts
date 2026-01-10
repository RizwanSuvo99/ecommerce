import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

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
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<CartSummary> {
    let cart = await this.findCartRaw(userId, sessionId);

    if (cart) {
      return this.buildCartSummary(cart);
    }

    cart = await this.prisma.cart.create({
      data: {
        ...(userId ? { userId } : {}),
        ...(sessionId ? { sessionId } : {}),
        expiresAt: this.getCartExpiry(),
      },
      include: {
        items: {
          include: { product: this.productSelect() },
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
   */
  async getCart(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.findCartRaw(userId, sessionId);

    if (!cart) {
      return this.getOrCreateCart(userId, sessionId);
    }

    return this.buildCartSummary(cart);
  }

  /**
   * Add an item to the cart with stock validation.
   *
   * If the product already exists in the cart, the quantity is incremented.
   * Validates that the product exists, is active, and has sufficient stock.
   *
   * @param dto - Add cart item data
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Updated cart summary
   */
  async addItem(
    dto: AddCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    // Validate product exists and is in stock
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not available for purchase');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${product.stock} items available.`,
      );
    }

    // Get or create cart
    const cartSummary = await this.getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cartSummary.id,
        productId: dto.productId,
        variantId: dto.variantId || null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      // Validate combined stock
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Cannot add ${dto.quantity} more. You already have ${existingItem.quantity} in cart and only ${product.stock} are available.`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      this.logger.debug(
        `Updated cart item quantity: ${existingItem.id} -> ${newQuantity}`,
      );
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cartSummary.id,
          productId: dto.productId,
          variantId: dto.variantId || null,
          quantity: dto.quantity,
          price: product.price,
        },
      });

      this.logger.debug(
        `Added new item to cart: product ${dto.productId}, qty ${dto.quantity}`,
      );
    }

    return this.getCartByIdSummary(cartSummary.id);
  }

  /**
   * Update the quantity of a specific cart item.
   *
   * @param itemId - Cart item ID
   * @param dto - New quantity
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Updated cart summary
   */
  async updateItemQuantity(
    itemId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    this.verifyCartOwnership(cartItem.cart, userId, sessionId);

    // Validate stock
    if (cartItem.product.stock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${cartItem.product.stock} items available.`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    this.logger.debug(`Updated cart item ${itemId} quantity to ${dto.quantity}`);

    return this.getCartByIdSummary(cartItem.cartId);
  }

  /**
   * Remove a specific item from the cart.
   *
   * @param itemId - Cart item ID to remove
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Updated cart summary
   */
  async removeItem(
    itemId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    this.verifyCartOwnership(cartItem.cart, userId, sessionId);

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    this.logger.debug(`Removed cart item: ${itemId}`);

    return this.getCartByIdSummary(cartItem.cartId);
  }

  /**
   * Remove all items from the cart.
   *
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Updated (empty) cart summary
   */
  async clearCart(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.findCartRaw(userId, sessionId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Also remove any applied coupon
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: null, discount: 0 },
    });

    this.logger.log(`Cleared cart: ${cart.id}`);

    return this.getCartByIdSummary(cart.id);
  }

  /**
   * Merge a guest cart into an authenticated user's cart.
   */
  async mergeGuestCart(userId: string, sessionId: string): Promise<CartSummary> {
    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId, userId: null },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    const userCartSummary = await this.getOrCreateCart(userId);
    const userCartId = userCartSummary.id;

    for (const guestItem of guestCart.items) {
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCartId,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
        },
      });

      if (existingItem) {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + guestItem.quantity },
        });
      } else {
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

    await this.prisma.cart.delete({ where: { id: guestCart.id } });

    this.logger.log(
      `Merged guest cart ${guestCart.id} (${guestCart.items.length} items) into user cart ${userCartId}`,
    );

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
          include: { product: this.productSelect() },
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

  private async findCartRaw(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) return null;

    return this.prisma.cart.findFirst({
      where: {
        ...(userId ? { userId } : { sessionId, userId: null }),
      },
      include: {
        items: {
          include: { product: this.productSelect() },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  private productSelect() {
    return {
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
    };
  }

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
   * Verify that the requesting user/session owns the cart.
   */
  private verifyCartOwnership(
    cart: any,
    userId?: string,
    sessionId?: string,
  ): void {
    if (userId && cart.userId === userId) return;
    if (sessionId && cart.sessionId === sessionId && !cart.userId) return;

    throw new BadRequestException('You do not have access to this cart');
  }

  private getCartExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    return expiry;
  }
}
