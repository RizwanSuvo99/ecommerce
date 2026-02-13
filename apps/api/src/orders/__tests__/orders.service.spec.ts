import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from '../../../test/utils/prisma-mock';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };

  const mockCartWithItems = {
    id: 'cart-1',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
        price: 2999,
        product: { id: 'prod-1', name: 'Product 1', stock: 10, price: 2999 },
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        quantity: 1,
        price: 1500,
        product: { id: 'prod-2', name: 'Product 2', stock: 5, price: 1500 },
      },
    ],
    subtotal: 7498,
    discount: 0,
    total: 7498,
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-20260214-0001',
    userId: 'user-1',
    status: 'PENDING',
    subtotal: 7498,
    shippingCost: 100,
    tax: 375,
    discount: 0,
    total: 7973,
    shippingAddress: {
      name: 'Test User',
      address: '123 Test St',
      city: 'Dhaka',
      postalCode: '1205',
      country: 'BD',
    },
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createOrder', () => {
    const createOrderDto = {
      cartId: 'cart-1',
      shippingAddress: {
        name: 'Test User',
        address: '123 Test St',
        city: 'Dhaka',
        postalCode: '1205',
        country: 'BD',
      },
      paymentMethod: 'STRIPE',
    };

    it('should create an order from cart', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCartWithItems);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn(prisma);
      });
      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.order.count.mockResolvedValue(0);

      const result = await service.createOrder('user-1', createOrderDto);

      expect(prisma.cart.findFirst).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty cart', async () => {
      prisma.cart.findFirst.mockResolvedValue({ ...mockCartWithItems, items: [] });

      await expect(
        service.createOrder('user-1', createOrderDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with date prefix', async () => {
      prisma.order.count.mockResolvedValue(5);

      const orderNumber = await service.generateOrderNumber();

      expect(orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    });

    it('should increment sequence number based on daily count', async () => {
      prisma.order.count.mockResolvedValue(42);

      const orderNumber = await service.generateOrderNumber();

      expect(orderNumber).toContain('-0043');
    });
  });

  describe('updateStatus', () => {
    it('should transition from PENDING to CONFIRMED', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'CONFIRMED',
      });

      const result = await service.updateStatus('order-1', 'CONFIRMED');

      expect(result.status).toBe('CONFIRMED');
    });

    it('should transition from CONFIRMED to PROCESSING', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'CONFIRMED',
      });
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });

      const result = await service.updateStatus('order-1', 'PROCESSING');

      expect(result.status).toBe('PROCESSING');
    });

    it('should transition from PROCESSING to SHIPPED', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPED',
      });

      const result = await service.updateStatus('order-1', 'SHIPPED');

      expect(result.status).toBe('SHIPPED');
    });

    it('should reject invalid status transitions', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'DELIVERED',
      });

      await expect(
        service.updateStatus('order-1', 'PENDING'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', 'CONFIRMED'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order and restore stock', async () => {
      const orderWithItems = {
        ...mockOrder,
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
        ],
      };
      prisma.order.findUnique.mockResolvedValue(orderWithItems);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(prisma));
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
      });

      const result = await service.cancelOrder('order-1', 'user-1');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.status).toBe('CANCELLED');
    });

    it('should reject cancellation of shipped orders', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPED',
      });

      await expect(
        service.cancelOrder('order-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateShipping', () => {
    it('should return free shipping for orders over threshold', () => {
      const result = service.calculateShipping(10000, 'BD');
      expect(result).toBe(0);
    });

    it('should calculate flat rate shipping for domestic orders', () => {
      const result = service.calculateShipping(2000, 'BD');
      expect(result).toBe(100);
    });

    it('should calculate higher shipping for international orders', () => {
      const result = service.calculateShipping(2000, 'US');
      expect(result).toBeGreaterThan(100);
    });
  });

  describe('calculateTax', () => {
    it('should calculate 5% tax for BD orders', () => {
      const result = service.calculateTax(10000, 'BD');
      expect(result).toBe(500);
    });

    it('should calculate 0% tax for international orders', () => {
      const result = service.calculateTax(10000, 'US');
      expect(result).toBe(0);
    });
  });
});
