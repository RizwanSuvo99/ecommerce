import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
