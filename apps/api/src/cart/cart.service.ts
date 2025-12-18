import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

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
    quantity: number;
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

  // ─── Cart Lifecycle ──────────────────────────────────────────────────────────

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

  // ─── Item Operations ─────────────────────────────────────────────────────────

  /**
   * Add an item to the cart with stock validation.
   */
  async addItem(
    dto: AddCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not available for purchase');
    }

    if (product.quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${product.quantity} items available.`,
      );
    }

    const cartSummary = await this.getOrCreateCart(userId, sessionId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cartSummary.id,
        productId: dto.productId,
        variantId: dto.variantId || null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (product.quantity < newQuantity) {
        throw new BadRequestException(
          `Cannot add ${dto.quantity} more. You already have ${existingItem.quantity} in cart and only ${product.quantity} are available.`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
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
    }

    return this.getCartByIdSummary(cartSummary.id);
  }

  /**
   * Update the quantity of a specific cart item.
   */
  async updateItemQuantity(
    itemId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    this.verifyCartOwnership(cartItem.cart, userId, sessionId);

    if (cartItem.product.quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${cartItem.product.quantity} items available.`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCartByIdSummary(cartItem.cartId);
  }

  /**
   * Remove a specific item from the cart.
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

    this.verifyCartOwnership(cartItem.cart, userId, sessionId);

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCartByIdSummary(cartItem.cartId);
  }

  /**
   * Remove all items from the cart.
   */
  async clearCart(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.findCartRaw(userId, sessionId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: null, discount: 0 },
    });

    return this.getCartByIdSummary(cart.id);
  }

  // ─── Coupon Operations ────────────────────────────────────────────────────────

  /**
   * Apply a coupon code to the cart.
   *
   * Validates the coupon exists, is active, has not expired, and has not
   * exceeded its usage limit. Calculates the discount based on coupon type
   * (percentage or fixed amount) and minimum order requirements.
   *
   * @param dto - Coupon code to apply
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Updated cart summary with discount applied
   */
  async applyCoupon(
    dto: ApplyCouponDto,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const cart = await this.findCartRaw(userId, sessionId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Look up the coupon
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    // Validate coupon is active
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    // Validate expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }

    // Validate start date
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
      throw new BadRequestException('This coupon is not yet active');
    }

    // Validate usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Calculate cart subtotal for minimum order validation
    const cartSummary = this.buildCartSummary(cart);

    if (coupon.minOrderAmount && cartSummary.subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount of ৳${coupon.minOrderAmount} required for this coupon`,
      );
    }

    // Calculate discount
    let discount: number;

    if (coupon.type === 'PERCENTAGE') {
      discount = (cartSummary.subtotal * Number(coupon.value)) / 100;

      // Apply max discount cap if set
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      // FIXED amount discount
      discount = Number(coupon.value);
    }

    // Ensure discount does not exceed subtotal
    discount = Math.min(discount, cartSummary.subtotal);

    // Apply coupon to cart
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: coupon.code,
        discount,
      },
    });

    this.logger.log(
      `Applied coupon "${coupon.code}" to cart ${cart.id}: discount ৳${discount.toFixed(2)}`,
    );

    return this.getCartByIdSummary(cart.id);
  }

  /**
   * Remove the applied coupon from the cart.
   *
   * @param userId - Authenticated user ID (optional)
   * @param sessionId - Guest session identifier (optional)
   * @returns Updated cart summary with coupon removed
   */
  async removeCoupon(
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const cart = await this.findCartRaw(userId, sessionId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.couponCode) {
      throw new BadRequestException('No coupon is applied to this cart');
    }

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: null,
        discount: 0,
      },
    });

    this.logger.log(`Removed coupon from cart ${cart.id}`);

    return this.getCartByIdSummary(cart.id);
  }

  // ─── Cart Merge ───────────────────────────────────────────────────────────────

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
        quantity: true,
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
      product: {
        ...item.product,
        stock: item.product.quantity,
      },
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
