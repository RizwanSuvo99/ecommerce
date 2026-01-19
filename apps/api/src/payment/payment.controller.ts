import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { PaymentService } from './payment.service';

interface CreateCheckoutSessionDto {
  orderId: string;
  items: Array<{
    name: string;
    description?: string;
    image?: string;
    quantity: number;
    priceBDT: number;
  }>;
  shippingCostBDT?: number;
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('stripe/create-session')
  @UseGuards(AuthGuard('jwt'))
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    const session = await this.paymentService.createCheckoutSession({
      orderId: body.orderId,
      items: body.items,
      customerEmail: user.email,
      shippingCostBDT: body.shippingCostBDT,
    });

    return {
      success: true,
      data: session,
    };
  }

  @Get('order/:orderId')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    const payment = await this.paymentService.getPaymentByOrderId(orderId);

    return {
      success: true,
      data: payment,
    };
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentStats() {
    const stats = await this.paymentService.getPaymentStats();

    return {
      success: true,
      data: stats,
    };
  }
}
