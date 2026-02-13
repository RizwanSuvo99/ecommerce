import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanDatabase, createTestUser, getAuthToken } from './utils/test-utils';
import { JwtService } from '@nestjs/jwt';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let customerToken: string;
  let createdProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    const jwtService = app.get<JwtService>(JwtService);

    const admin = await createTestUser(prisma, {
      email: 'admin-products@example.com',
      role: 'ADMIN',
    });
    const customer = await createTestUser(prisma, {
      email: 'customer-products@example.com',
      role: 'CUSTOMER',
    });

    adminToken = getAuthToken(jwtService, admin).accessToken;
    customerToken = getAuthToken(jwtService, customer).accessToken;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a product as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test Product',
          description: 'A test product for e2e testing',
          price: 2999,
          sku: 'E2E-TEST-001',
          stock: 50,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Test Product');
      expect(response.body.slug).toBe('e2e-test-product');
      expect(response.body.price).toBe(2999);

      createdProductId = response.body.id;
    });

    it('should reject product creation by customer', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Product',
          price: 1000,
          sku: 'UNAUTH-001',
          stock: 10,
        })
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Missing required fields' })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('should list products with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
    });

    it('should filter products by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ minPrice: 2000, maxPrice: 3000 })
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(2000);
        expect(product.price).toBeLessThanOrEqual(3000);
      });
    });

    it('should search products by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ search: 'E2E Test' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('E2E Test');
    });
  });

  describe('GET /products/:slug', () => {
    it('should return product by slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/e2e-test-product')
        .expect(200);

      expect(response.body.name).toBe('E2E Test Product');
      expect(response.body.slug).toBe('e2e-test-product');
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/products/nonexistent-product')
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 3499, stock: 75 })
        .expect(200);

      expect(response.body.price).toBe(3499);
      expect(response.body.stock).toBe(75);
    });

    it('should reject updates by customer', async () => {
      await request(app.getHttpServer())
        .patch(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 100 })
        .expect(403);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should archive a product (soft delete)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('ARCHIVED');
    });
  });

  describe('Full product CRUD flow', () => {
    it('should complete create → read → update → archive', async () => {
      // Create
      const createRes = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Flow Test Product',
          description: 'CRUD flow test',
          price: 1500,
          sku: 'FLOW-001',
          stock: 25,
        })
        .expect(201);

      const productId = createRes.body.id;

      // Read by slug
      await request(app.getHttpServer())
        .get('/products/flow-test-product')
        .expect(200);

      // Update
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Flow Product', price: 1800 })
        .expect(200);

      // Archive
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
