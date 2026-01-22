import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Headers,
  Query,
  Req,
  RawBodyRequest,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { PaymentService } from './payment.service';
import { RefundDto } from './dto/refund.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

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
  customerEmail?: string;
}

interface CreateCODPaymentDto {
  orderId: string;
  amountBDT: number;
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('stripe/create-session')
  @UseGuards(OptionalAuthGuard)
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    // Use user email for authenticated, or body.customerEmail for guests
    const customerEmail = user?.email || body.customerEmail || '';

    const session = await this.paymentService.createCheckoutSession({
      orderId: body.orderId,
      items: body.items,
      customerEmail,
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

  @Post('admin/refund/:orderId')
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

  @Post('cod/create')
  @UseGuards(OptionalAuthGuard)
  async createCODPayment(@Body() body: CreateCODPaymentDto) {
    const result = await this.paymentService.createCODPayment(
      body.orderId,
      body.amountBDT,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Patch('admin/cod/:orderId/paid')
  @UseGuards(AuthGuard('jwt'))
  async markCODPaid(@Param('orderId') orderId: string) {
    const result = await this.paymentService.markCODPaid(orderId);

    return {
      success: true,
      data: result,
    };
  }

  @Get('order/:orderId')
  @UseGuards(OptionalAuthGuard)
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
