import { PrismaService } from '../../src/prisma/prisma.service';

type MockPrismaModel = {
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  deleteMany: jest.Mock;
  count: jest.Mock;
  aggregate: jest.Mock;
  upsert: jest.Mock;
};

function createMockModel(): MockPrismaModel {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    upsert: jest.fn(),
  };
}

export type MockPrismaService = {
  [K in keyof PrismaService]: K extends
    | 'user'
    | 'product'
    | 'category'
    | 'brand'
    | 'cart'
    | 'cartItem'
    | 'order'
    | 'orderItem'
    | 'payment'
    | 'coupon'
    | 'review'
    | 'wishlist'
    | 'wishlistItem'
    | 'page'
    | 'banner'
    | 'menu'
    | 'auditLog'
    | 'newsletterSubscription'
    | 'productVariant'
    | 'setting'
    ? MockPrismaModel
    : PrismaService[K];
} & {
  $transaction: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
};

export function createMockPrismaService(): MockPrismaService {
  return {
    user: createMockModel(),
    product: createMockModel(),
    category: createMockModel(),
    brand: createMockModel(),
    cart: createMockModel(),
    cartItem: createMockModel(),
    order: createMockModel(),
    orderItem: createMockModel(),
    payment: createMockModel(),
    coupon: createMockModel(),
    review: createMockModel(),
    wishlist: createMockModel(),
    wishlistItem: createMockModel(),
    page: createMockModel(),
    banner: createMockModel(),
    menu: createMockModel(),
    auditLog: createMockModel(),
    newsletterSubscription: createMockModel(),
    productVariant: createMockModel(),
    setting: createMockModel(),
    $transaction: jest.fn((fn: any) => fn(this)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  } as unknown as MockPrismaService;
}
