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
