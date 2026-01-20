import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
  RawBodyRequest,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { PaymentService } from './payment.service';
import { RefundDto } from './dto/refund.dto';

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

  @Post('stripe/webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { success: false, error: 'Missing raw body' };
    }

    const result = await this.paymentService.handleWebhook(rawBody, signature);

    return {
      success: true,
      data: result,
    };
  }

  @Post('admin/payment/refund/:orderId')
  @UseGuards(AuthGuard('jwt'))
  async processRefund(
    @Param('orderId') orderId: string,
    @Body() refundDto: RefundDto,
  ) {
    const result = await this.paymentService.processRefund(
      orderId,
      refundDto.type,
      refundDto.amountBDT,
      refundDto.reason,
    );

    return {
      success: true,
      data: result,
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
