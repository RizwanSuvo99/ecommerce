import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface TestProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku: string;
}

export interface TestOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  total: number;
}

export async function createTestUser(
  prisma: PrismaService,
  overrides: Partial<TestUser> = {},
): Promise<TestUser> {
  const password = overrides.password || 'TestPassword123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      id: overrides.id || uuidv4(),
      email: overrides.email || `test-${uuidv4().slice(0, 8)}@example.com`,
      password: hashedPassword,
      name: overrides.name || 'Test User',
      role: overrides.role || 'CUSTOMER',
      emailVerified: true,
    },
  });

  return { ...user, password } as TestUser;
}

export async function createTestProduct(
  prisma: PrismaService,
  overrides: Partial<TestProduct> = {},
): Promise<TestProduct> {
  const name = overrides.name || `Test Product ${uuidv4().slice(0, 8)}`;
  const slug = overrides.slug || name.toLowerCase().replace(/\s+/g, '-');

  const product = await prisma.product.create({
    data: {
      id: overrides.id || uuidv4(),
      name,
      slug,
      price: overrides.price || 1999,
      sku: overrides.sku || `SKU-${uuidv4().slice(0, 8).toUpperCase()}`,
      description: 'Test product description',
      status: 'ACTIVE',
      stock: 100,
      categoryId: null,
      brandId: null,
    },
  });

  return product as TestProduct;
}

export async function createTestOrder(
  prisma: PrismaService,
  userId: string,
  overrides: Partial<TestOrder> = {},
): Promise<TestOrder> {
  const order = await prisma.order.create({
    data: {
      id: overrides.id || uuidv4(),
      orderNumber: overrides.orderNumber || `ORD-${Date.now()}`,
      userId,
      status: overrides.status || 'PENDING',
      subtotal: overrides.total || 1999,
      total: overrides.total || 1999,
      shippingCost: 0,
      tax: 0,
      shippingAddress: {
        name: 'Test User',
        address: '123 Test St',
        city: 'Dhaka',
        postalCode: '1205',
        country: 'BD',
      },
    },
  });

  return order as TestOrder;
}

export function getAuthToken(
  jwtService: JwtService,
  user: TestUser,
): { accessToken: string; refreshToken: string } {
  const payload = { sub: user.id, email: user.email, role: user.role };

  const accessToken = jwtService.sign(payload, {
    secret: 'test-jwt-secret',
    expiresIn: '15m',
  });

  const refreshToken = jwtService.sign(
    { sub: user.id, type: 'refresh' },
    { secret: 'test-jwt-refresh-secret', expiresIn: '7d' },
  );

  return { accessToken, refreshToken };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  const models = [
    'orderItem',
    'order',
    'cartItem',
    'cart',
    'wishlistItem',
    'wishlist',
    'review',
    'payment',
    'product',
    'category',
    'brand',
    'coupon',
    'user',
    'auditLog',
    'newsletterSubscription',
  ];

  for (const model of models) {
    await (prisma as any)[model]?.deleteMany?.();
  }
}
