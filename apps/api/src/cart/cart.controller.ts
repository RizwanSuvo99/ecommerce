import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Headers,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

/**
 * Shopping cart controller.
 *
 * All cart endpoints support both authenticated users and guests.
 * Guest carts are identified by the X-Session-Id header.
 */
@Controller('cart')
@UseGuards(OptionalAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get the current cart with items, subtotal, discount, total, and item count.
   *
   * GET /cart
   */
  @Get()
  async getCart(
    @CurrentUser() user: AuthenticatedUser | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.getCart(
      user?.id,
      !user ? sessionId : undefined,
    );
  }

  /**
   * Get or create the current user's/guest's cart.
   *
   * POST /cart
   */
  @Post()
  async getOrCreateCart(
    @CurrentUser() user: AuthenticatedUser | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.getOrCreateCart(
      user?.id,
      !user ? sessionId : undefined,
    );
  }

  /**
   * Add an item to the cart.
   *
   * POST /cart/items
   *
   * Validates product availability and stock before adding.
   * If the product already exists in the cart, increments quantity.
   */
  @Post('items')
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: AuthenticatedUser | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.addItem(
      dto,
      user?.id,
      !user ? sessionId : undefined,
    );
  }

  /**
   * Update the quantity of a cart item.
   *
   * PATCH /cart/items/:itemId
   */
  @Patch('items/:itemId')
  async updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: AuthenticatedUser | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.updateItemQuantity(
      itemId,
      dto,
      user?.id,
      !user ? sessionId : undefined,
    );
  }

  /**
   * Remove a specific item from the cart.
   *
   * DELETE /cart/items/:itemId
   */
  @Delete('items/:itemId')
  async removeItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: AuthenticatedUser | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.removeItem(
      itemId,
      user?.id,
      !user ? sessionId : undefined,
    );
  }

  /**
   * Remove all items from the cart.
   *
   * DELETE /cart/items
   */
  @Delete('items')
  async clearCart(
    @CurrentUser() user: AuthenticatedUser | null,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.clearCart(
      user?.id,
      !user ? sessionId : undefined,
    );
  }

  /**
   * Merge a guest cart into the authenticated user's cart.
   *
   * POST /cart/merge
   */
  @Post('merge')
  async mergeGuestCart(
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-session-id') sessionId: string,
  ) {
    if (!user?.id || !sessionId) {
      return this.cartService.getOrCreateCart(user?.id);
    }

    return this.cartService.mergeGuestCart(user.id, sessionId);
  }
}
