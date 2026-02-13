import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from '../../../test/utils/prisma-mock';

describe('CartService', () => {
  let service: CartService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    sessionId: null,
    items: [],
    couponId: null,
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'Test Product',
    price: 2999,
    stock: 10,
    status: 'ACTIVE',
  };

  const mockCartWithItems = {
    ...mockCart,
    items: [
      {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 2,
        price: 2999,
        product: mockProduct,
      },
    ],
    subtotal: 5998,
    total: 5998,
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getOrCreateCart', () => {
    it('should return existing cart for authenticated user', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart({ userId: 'user-1' });

      expect(prisma.cart.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCart);
    });

    it('should create new cart if none exists', async () => {
      prisma.cart.findFirst.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart({ userId: 'user-1' });

      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'user-1' }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCart);
    });

    it('should handle guest cart with sessionId', async () => {
      prisma.cart.findFirst.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({
        ...mockCart,
        userId: null,
        sessionId: 'sess-123',
      });

      const result = await service.getOrCreateCart({ sessionId: 'sess-123' });

      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sessionId: 'sess-123' }),
        include: expect.any(Object),
      });
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCart);
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cartItem.findFirst.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 1,
        price: 2999,
      });
      prisma.cart.findFirst.mockResolvedValue(mockCartWithItems);

      const result = await service.addItem('cart-1', {
        productId: 'prod-1',
        quantity: 1,
      });

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
    });

    it('should throw BadRequestException if product out of stock', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCart);
      prisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 0 });

      await expect(
        service.addItem('cart-1', { productId: 'prod-1', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if requested quantity exceeds stock', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCart);
      prisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 3 });

      await expect(
        service.addItem('cart-1', { productId: 'prod-1', quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should increment quantity if item already in cart', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCartWithItems);
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cartItem.findFirst.mockResolvedValue(mockCartWithItems.items[0]);
      prisma.cartItem.update.mockResolvedValue({
        ...mockCartWithItems.items[0],
        quantity: 3,
      });

      await service.addItem('cart-1', { productId: 'prod-1', quantity: 1 });

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 3 },
      });
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      prisma.cartItem.findUnique.mockResolvedValue(mockCartWithItems.items[0]);
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.cartItem.update.mockResolvedValue({
        ...mockCartWithItems.items[0],
        quantity: 5,
      });

      await service.updateQuantity('item-1', 5);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 5 },
      });
    });

    it('should throw NotFoundException for non-existent item', async () => {
      prisma.cartItem.findUnique.mockResolvedValue(null);

      await expect(service.updateQuantity('nonexistent', 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      prisma.cartItem.findUnique.mockResolvedValue(mockCartWithItems.items[0]);
      prisma.cartItem.delete.mockResolvedValue(mockCartWithItems.items[0]);

      await service.removeItem('item-1');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });

  describe('applyCoupon', () => {
    const mockCoupon = {
      id: 'coupon-1',
      code: 'SAVE20',
      type: 'PERCENTAGE',
      value: 20,
      minOrderAmount: 1000,
      maxUses: 100,
      usedCount: 10,
      isActive: true,
      expiresAt: new Date('2027-01-01'),
    };

    it('should apply a valid coupon to cart', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCartWithItems);
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.cart.update.mockResolvedValue({
        ...mockCartWithItems,
        couponId: 'coupon-1',
        discount: 1200,
        total: 4798,
      });

      const result = await service.applyCoupon('cart-1', 'SAVE20');

      expect(prisma.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'SAVE20' },
      });
      expect(result.discount).toBe(1200);
    });

    it('should throw BadRequestException for expired coupon', async () => {
      prisma.cart.findFirst.mockResolvedValue(mockCartWithItems);
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        expiresAt: new Date('2025-01-01'),
      });

      await expect(service.applyCoupon('cart-1', 'SAVE20')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('mergeGuestCart', () => {
    it('should merge guest cart into user cart', async () => {
      const guestCart = {
        ...mockCartWithItems,
        userId: null,
        sessionId: 'sess-123',
      };
      const userCart = { ...mockCart, userId: 'user-1' };

      prisma.cart.findFirst
        .mockResolvedValueOnce(guestCart)
        .mockResolvedValueOnce(userCart);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(prisma));
      prisma.cartItem.create.mockResolvedValue(mockCartWithItems.items[0]);
      prisma.cart.delete.mockResolvedValue(guestCart);

      await service.mergeGuestCart('sess-123', 'user-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should do nothing if no guest cart exists', async () => {
      prisma.cart.findFirst.mockResolvedValue(null);

      await service.mergeGuestCart('sess-123', 'user-1');

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
