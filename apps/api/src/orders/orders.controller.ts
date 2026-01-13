import {
  Controller,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Orders controller.
 *
 * Handles order creation, retrieval, status management, and cancellation.
 * All endpoints require authentication; admin endpoints require ADMIN role.
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
}
