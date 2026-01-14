import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
   * POST /orders
   */
  @Post('orders')
  async createOrder(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.createOrder(dto, user.id);
  }

  // ─── Order Listing ────────────────────────────────────────────────────────────

  /**
   * Get the authenticated user's orders (paginated).
   *
   * GET /orders?page=1&limit=10
   */
  @Get('orders')
  async findUserOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.findUserOrders(user.id, { page, limit });
  }

  /**
   * Get a single order by order number.
   *
   * The authenticated user can only view their own orders.
   *
   * GET /orders/:orderNumber
   */
  @Get('orders/:orderNumber')
  async findOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.findOrderByNumber(orderNumber, user.id);
  }

  // ─── Admin: Order Listing ─────────────────────────────────────────────────────

  /**
   * Get all orders (admin view) with optional status filter.
   *
   * GET /admin/orders?page=1&limit=20&status=PENDING
   */
  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAllOrders({ page, limit, status });
  }
}
