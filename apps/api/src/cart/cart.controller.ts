import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';

import { CartService } from './cart.service';
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
   * Get or create the current user's/guest's cart.
   *
   * POST /cart
   *
   * For authenticated users, retrieves or creates a user-bound cart.
   * For guests, requires X-Session-Id header to identify the session.
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
   * Merge a guest cart into the authenticated user's cart.
   *
   * POST /cart/merge
   *
   * Called after login to transfer guest cart items to the user's cart.
   * Requires both authentication and X-Session-Id header.
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
