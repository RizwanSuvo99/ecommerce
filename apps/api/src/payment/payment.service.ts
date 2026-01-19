import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PrismaService } from '../prisma/prisma.service';

const BDT_TO_USD_RATE = 0.0091;

export function convertBDTtoUSDCents(amountBDT: number): number {
  const usd = amountBDT * BDT_TO_USD_RATE;
  return Math.round(usd * 100);
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-04-10',
    });
  }

  getStripeInstance(): Stripe {
    return this.stripe;
  }

  async createCheckoutSession(params: {
    orderId: string;
    items: Array<{
      name: string;
      description?: string;
      image?: string;
      quantity: number;
      priceBDT: number;
    }>;
    customerEmail: string;
    shippingCostBDT?: number;
  }) {
    const { orderId, items, customerEmail, shippingCostBDT = 0 } = params;

    this.logger.log(`Creating Stripe checkout session for order ${orderId}`);

    const totalBDT = items.reduce(
      (sum, item) => sum + item.priceBDT * item.quantity,
      0,
    ) + shippingCostBDT;

    this.validateAmount(totalBDT);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || `Price: ${formatBDT(item.priceBDT)}`,
            ...(item.image && { images: [item.image] }),
          },
          unit_amount: convertBDTtoUSDCents(item.priceBDT),
        },
        quantity: item.quantity,
      }),
    );

    if (shippingCostBDT > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: `Shipping cost: ${formatBDT(shippingCostBDT)}`,
          },
          unit_amount: convertBDTtoUSDCents(shippingCostBDT),
        },
        quantity: 1,
      });
    }

    const successUrl = `${this.config.get('FRONTEND_URL')}/checkout/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`;
    const cancelUrl = `${this.config.get('FRONTEND_URL')}/checkout/payment/cancel?order_id=${orderId}`;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        orderId,
        totalBDT: totalBDT.toString(),
        currency: 'BDT',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await this.createPaymentRecord({
      orderId,
      method: 'STRIPE',
      amount: totalBDT,
      currency: 'BDT',
      status: 'PENDING',
      stripeSessionId: session.id,
    });

    this.logger.log(
      `Checkout session created: ${session.id} for ${formatBDT(totalBDT)} (${convertBDTtoUSDCents(totalBDT)} USD cents)`,
    );

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      totalBDT,
      totalFormatted: formatBDT(totalBDT),
      totalUSDCents: convertBDTtoUSDCents(totalBDT),
    };
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment not found for order ${orderId}`);
    }

    return payment;
  }

  async createPaymentRecord(data: {
    orderId: string;
    method: 'STRIPE' | 'COD';
    amount: number;
    currency: string;
    status: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }) {
    this.logger.log(
      `Creating payment record for order ${data.orderId}: ${formatBDT(data.amount)}`,
    );

    return this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        method: data.method,
        amount: data.amount,
        currency: data.currency || 'BDT',
        status: data.status,
        stripeSessionId: data.stripeSessionId,
        stripePaymentIntentId: data.stripePaymentIntentId,
      },
    });
  }

  async updatePaymentStatus(paymentId: string, status: string, metadata?: Record<string, any>) {
    this.logger.log(`Updating payment ${paymentId} status to ${status}`);

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(metadata && { metadata }),
        updatedAt: new Date(),
      },
    });
  }

  async getPaymentStats() {
    const [totalRevenue, totalPayments, pendingPayments] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalRevenueFormatted: formatBDT(totalRevenue._sum.amount || 0),
      totalPayments,
      pendingPayments,
      currency: 'BDT',
    };
  }

  validateAmount(amount: number): void {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than ৳0');
    }

    if (amount > 500000) {
      throw new BadRequestException('Payment amount cannot exceed ৳500,000');
    }
  }
}
