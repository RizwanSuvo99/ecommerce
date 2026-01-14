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
   * POST /checkout/validate
   */
  @Post('checkout/validate')
  async validateCheckout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.validateCheckout(dto, user.id);
  }

  // ─── Order Creation ───────────────────────────────────────────────────────────

  /**
   * Create a new order from the authenticated user's cart.
   *
   * Snapshots current prices, decrements inventory, creates the order
   * with all items, and clears the cart — all within a single transaction.
   *
   * POST /orders
   */
  @Post('orders')
  async createOrder(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.createOrder(dto, user.id);
  }
}
