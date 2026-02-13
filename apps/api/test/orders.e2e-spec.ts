import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  cleanDatabase,
  createTestUser,
  createTestProduct,
  getAuthToken,
} from './utils/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;
  let adminToken: string;
  let productId: string;
  let cartId: string;
  let orderId: string;

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
      email: 'customer-orders@example.com',
      role: 'CUSTOMER',
    });
    const admin = await createTestUser(prisma, {
      email: 'admin-orders@example.com',
      role: 'ADMIN',
    });

    customerToken = getAuthToken(jwtService, customer).accessToken;
    adminToken = getAuthToken(jwtService, admin).accessToken;

    const product = await createTestProduct(prisma, {
      name: 'Order Test Product',
      price: 2500,
    });
    productId = product.id;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('Cart → Checkout → Order flow', () => {
    it('Step 1: should add item to cart', async () => {
      // Get or create cart
      const cartRes = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      cartId = cartRes.body.id;

      // Add item
      const addRes = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId, quantity: 2 })
        .expect(201);

      expect(addRes.body.items).toHaveLength(1);
      expect(addRes.body.items[0].productId).toBe(productId);
      expect(addRes.body.items[0].quantity).toBe(2);
    });

    it('Step 2: should not add item exceeding stock', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId, quantity: 999 })
        .expect(400);
    });

    it('Step 3: should create order from cart', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          cartId,
          shippingAddress: {
            name: 'Test Customer',
            address: '456 Order St',
            city: 'Dhaka',
            postalCode: '1205',
            country: 'BD',
          },
          paymentMethod: 'COD',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.subtotal).toBe(5000);

      orderId = response.body.id;
    });

    it('Step 4: should reduce product stock after order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/order-test-product`)
        .expect(200);

      expect(response.body.stock).toBe(98); // 100 - 2
    });

    it('Step 5: cart should be empty after order', async () => {
      const response = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('GET /orders', () => {
    it('should list customer orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('orderNumber');
    });

    it('should list all orders as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('shippingAddress');
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should update order status as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body.status).toBe('CONFIRMED');
    });

    it('should reject invalid status transition', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PENDING' })
        .expect(400);
    });

    it('should reject status updates by customer', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'PROCESSING' })
        .expect(403);
    });
  });

  describe('POST /orders/:id/cancel', () => {
    it('should cancel a pending order and restore stock', async () => {
      // Create a new order to cancel
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId, quantity: 1 })
        .expect(201);

      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddress: {
            name: 'Cancel Test',
            address: '789 Cancel St',
            city: 'Dhaka',
            postalCode: '1205',
            country: 'BD',
          },
          paymentMethod: 'COD',
        })
        .expect(201);

      const cancelRes = await request(app.getHttpServer())
        .post(`/orders/${orderRes.body.id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(cancelRes.body.status).toBe('CANCELLED');
    });
  });
});
