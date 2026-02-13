import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  cleanDatabase,
  createTestUser,
  createTestProduct,
  createTestOrder,
  getAuthToken,
} from './utils/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('Payment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;
  let orderId: string;
  let userId: string;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_fake_webhook_secret';

  function generateStripeSignature(payload: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    const jwtService = app.get<JwtService>(JwtService);

    const customer = await createTestUser(prisma, {
      email: 'customer-payment@example.com',
      role: 'CUSTOMER',
    });
    userId = customer.id;
    customerToken = getAuthToken(jwtService, customer).accessToken;

    const order = await createTestOrder(prisma, userId, { total: 7973 });
    orderId = order.id;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('POST /payment/checkout-session', () => {
    it('should create a Stripe checkout session', async () => {
      const response = await request(app.getHttpServer())
        .post('/payment/checkout-session')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId })
        .expect(201);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('url');
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/payment/checkout-session')
        .send({ orderId })
        .expect(401);
    });
  });

  describe('POST /payment/webhook', () => {
    it('should handle checkout.session.completed event', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_completed',
            metadata: { orderId },
            payment_intent: 'pi_test_completed',
            amount_total: 7255,
            currency: 'usd',
          },
        },
      };

      const payload = JSON.stringify(event);
      const signature = generateStripeSignature(payload);

      await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      // Verify payment record was created
      const payment = await prisma.payment.findFirst({
        where: { orderId },
      });
      expect(payment).toBeTruthy();
      expect(payment?.status).toBe('COMPLETED');
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const failedOrder = await createTestOrder(prisma, userId, { total: 5000 });

      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_failed',
            metadata: { orderId: failedOrder.id },
            last_payment_error: { message: 'Your card was declined.' },
          },
        },
      };

      const payload = JSON.stringify(event);
      const signature = generateStripeSignature(payload);

      await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      const order = await prisma.order.findUnique({
        where: { id: failedOrder.id },
      });
      expect(order?.status).toBe('PAYMENT_FAILED');
    });

    it('should reject invalid webhook signatures', async () => {
      const payload = JSON.stringify({ type: 'test', data: {} });

      await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('stripe-signature', 't=123,v1=invalid_signature')
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(400);
    });

    it('should handle idempotent webhook delivery', async () => {
      const idempotentOrder = await createTestOrder(prisma, userId, { total: 3000 });

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_idempotent',
            metadata: { orderId: idempotentOrder.id },
            payment_intent: 'pi_test_idempotent',
            amount_total: 2730,
            currency: 'usd',
          },
        },
      };

      const payload = JSON.stringify(event);
      const signature = generateStripeSignature(payload);

      // First delivery
      await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('stripe-signature', signature)
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      // Second delivery (duplicate) - should not create duplicate payment
      const sig2 = generateStripeSignature(payload);
      await request(app.getHttpServer())
        .post('/payment/webhook')
        .set('stripe-signature', sig2)
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      const payments = await prisma.payment.findMany({
        where: { orderId: idempotentOrder.id },
      });
      expect(payments).toHaveLength(1);
    });
  });

  describe('POST /payment/cod', () => {
    it('should create a COD payment', async () => {
      const codOrder = await createTestOrder(prisma, userId, { total: 2000 });

      const response = await request(app.getHttpServer())
        .post('/payment/cod')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: codOrder.id })
        .expect(201);

      expect(response.body.method).toBe('COD');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.currency).toBe('BDT');
    });
  });

  describe('POST /payment/refund', () => {
    it('should process a refund for a paid order', async () => {
      // Create a payment record first
      await prisma.payment.create({
        data: {
          orderId,
          stripePaymentIntentId: 'pi_test_refund',
          amount: 7255,
          currency: 'usd',
          status: 'COMPLETED',
          method: 'STRIPE',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/payment/refund')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId })
        .expect(201);

      expect(response.body.status).toBe('REFUNDED');
    });
  });
});
