import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

/**
 * Orders controller.
 *
 * Handles order creation, retrieval, status management, and cancellation.
 * All endpoints require authentication; admin endpoints require ADMIN role.
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── Checkout ─────────────────────────────────────────────────────────────────

  /**
   * Validate checkout data before placing an order.
   *
   * Checks stock availability, verifies prices haven't changed,
   * validates the coupon (if provided), and confirms the shipping
   * address and method are valid.
   *
   * POST /checkout/validate
   */
  @Post('checkout/validate')
  async validateCheckout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.validateCheckout(dto, user.id);
  }
}
