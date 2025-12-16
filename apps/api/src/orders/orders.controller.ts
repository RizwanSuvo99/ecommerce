import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { ShippingService } from './shipping.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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
  constructor(
    private readonly ordersService: OrdersService,
    private readonly shippingService: ShippingService,
  ) {}

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
   * GET /orders/:orderNumber
   */
  @Get('orders/:orderNumber')
  async findOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.findOrderByNumber(orderNumber, user.id);
  }

  // ─── Order Cancellation ───────────────────────────────────────────────────────

  /**
   * Cancel an order (customer-initiated).
   *
   * POST /orders/:id/cancel
   */
  @Post('orders/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, user.id, reason);
  }

  // ─── Shipping ─────────────────────────────────────────────────────────────────

  /**
   * Calculate shipping cost for the given address.
   *
   * Returns available shipping methods with costs and delivery estimates.
   * Inside Dhaka: ৳60 standard, Outside Dhaka: ৳120 standard.
   * Free standard shipping on orders above ৳2000.
   *
   * GET /shipping/calculate?addressId=x
   */
  @Get('shipping/calculate')
  async calculateShipping(
    @Query('addressId') addressId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.shippingService.calculateShipping(addressId, user.id);
  }

  // ─── Admin: Order Management ──────────────────────────────────────────────────

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

  /**
   * Get a single order by ID (admin view).
   *
   * GET /admin/orders/:id
   */
  @Get('admin/orders/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findOrderById(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  /**
   * Update an order's status (admin only).
   *
   * PATCH /admin/orders/:id/status
   */
  @Patch('admin/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  /**
   * Cancel an order (admin-initiated).
   *
   * POST /admin/orders/:id/cancel
   */
  @Post('admin/orders/:id/cancel')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async adminCancelOrder(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.adminCancelOrder(id, reason);
  }
}
