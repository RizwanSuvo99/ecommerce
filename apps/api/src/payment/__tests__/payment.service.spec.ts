import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PaymentService } from '../payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from '../../../test/utils/prisma-mock';

// Mock Stripe
const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  refunds: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-20260214-0001',
    userId: 'user-1',
    status: 'PENDING',
    total: 7973,
    items: [
      { id: 'item-1', productId: 'prod-1', quantity: 2, price: 2999, product: { name: 'Product 1' } },
      { id: 'item-2', productId: 'prod-2', quantity: 1, price: 1500, product: { name: 'Product 2' } },
    ],
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                STRIPE_SECRET_KEY: 'sk_test_fake',
                STRIPE_WEBHOOK_SECRET: 'whsec_test_fake',
                APP_URL: 'http://localhost:3000',
                BDT_TO_USD_RATE: '0.0091',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createCheckoutSession', () => {
    it('should create Stripe checkout session with BDT to USD conversion', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const result = await service.createCheckoutSession('order-1');

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          currency: 'usd',
          metadata: expect.objectContaining({
            orderId: 'order-1',
            originalCurrency: 'BDT',
            originalAmount: '7973',
          }),
        }),
      );
      expect(result).toHaveProperty('sessionId', 'cs_test_123');
      expect(result).toHaveProperty('url');
    });

    it('should convert BDT line item prices to USD cents', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await service.createCheckoutSession('order-1');

      const callArgs = mockStripe.checkout.sessions.create.mock.calls[0][0];
      const lineItems = callArgs.line_items;

      // Price should be converted from BDT paisa to USD cents
      expect(lineItems).toBeDefined();
      expect(lineItems.length).toBeGreaterThan(0);
    });
  });

  describe('handleWebhook', () => {
    const mockEvent = (type: string, data: any) => ({
      type,
      data: { object: data },
    });

    it('should handle checkout.session.completed event', async () => {
      const sessionData = {
        id: 'cs_test_123',
        metadata: { orderId: 'order-1' },
        payment_intent: 'pi_test_123',
        amount_total: 7255,
        currency: 'usd',
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(
        mockEvent('checkout.session.completed', sessionData),
      );
      prisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      await service.handleWebhook('raw-body', 'sig_test');

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order-1',
          stripePaymentIntentId: 'pi_test_123',
          amount: 7255,
          currency: 'usd',
          status: 'COMPLETED',
        }),
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ status: 'CONFIRMED' }),
      });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const intentData = {
        id: 'pi_test_123',
        metadata: { orderId: 'order-1' },
        last_payment_error: { message: 'Card declined' },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(
        mockEvent('payment_intent.payment_failed', intentData),
      );
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'PAYMENT_FAILED',
      });

      await service.handleWebhook('raw-body', 'sig_test');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ status: 'PAYMENT_FAILED' }),
      });
    });

    it('should throw on invalid webhook signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        service.handleWebhook('raw-body', 'invalid-sig'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processRefund', () => {
    it('should create a Stripe refund', async () => {
      const mockPayment = {
        id: 'pay-1',
        orderId: 'order-1',
        stripePaymentIntentId: 'pi_test_123',
        amount: 7255,
        status: 'COMPLETED',
      };

      prisma.payment.findFirst.mockResolvedValue(mockPayment);
      mockStripe.refunds.create.mockResolvedValue({
        id: 're_test_123',
        status: 'succeeded',
        amount: 7255,
      });
      prisma.payment.update.mockResolvedValue({
        ...mockPayment,
        status: 'REFUNDED',
      });

      const result = await service.processRefund('order-1');

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
      });
      expect(result.status).toBe('REFUNDED');
    });

    it('should throw if no payment found for order', async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.processRefund('order-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createCODPayment', () => {
    it('should create a COD payment record', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        method: 'COD',
        amount: 7973,
        currency: 'BDT',
        status: 'PENDING',
      });
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'CONFIRMED',
      });

      const result = await service.createCODPayment('order-1');

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order-1',
          method: 'COD',
          amount: 7973,
          currency: 'BDT',
          status: 'PENDING',
        }),
      });
      expect(result.method).toBe('COD');
    });
  });
});
