import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService } from '../../../test/utils/prisma-mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockProduct = {
    id: 'prod-1',
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    description: 'High-quality wireless headphones',
    price: 4999,
    compareAtPrice: 6999,
    sku: 'SKU-WH001',
    stock: 50,
    status: 'ACTIVE',
    categoryId: 'cat-1',
    brandId: 'brand-1',
    images: ['headphones-1.jpg'],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const createDto = {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones',
      price: 4999,
      sku: 'SKU-WH001',
      stock: 50,
      categoryId: 'cat-1',
      brandId: 'brand-1',
    };

    it('should create a product with auto-generated slug', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.name,
          slug: 'wireless-headphones',
          price: createDto.price,
        }),
      });
      expect(result.slug).toBe('wireless-headphones');
    });

    it('should append suffix if slug already exists', async () => {
      prisma.product.findFirst
        .mockResolvedValueOnce({ id: 'existing', slug: 'wireless-headphones' })
        .mockResolvedValueOnce(null);
      prisma.product.create.mockResolvedValue({
        ...mockProduct,
        slug: 'wireless-headphones-1',
      });

      const result = await service.create(createDto);

      expect(result.slug).toBe('wireless-headphones-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const products = [mockProduct, { ...mockProduct, id: 'prod-2', name: 'Speaker' }];
      prisma.product.findMany.mockResolvedValue(products);
      prisma.product.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 12,
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ total: 2, page: 1, limit: 12, totalPages: 1 });
    });

    it('should apply category filter', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 12, categoryId: 'cat-1' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat-1' }),
        }),
      );
    });

    it('should apply price range filter', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 12, minPrice: 1000, maxPrice: 5000 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 1000, lte: 5000 },
          }),
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('wireless-headphones');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'wireless-headphones' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException for invalid slug', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        name: 'Updated Headphones',
        price: 3999,
      });

      const result = await service.update('prod-1', {
        name: 'Updated Headphones',
        price: 3999,
      });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: expect.objectContaining({ name: 'Updated Headphones', price: 3999 }),
      });
      expect(result.price).toBe(3999);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', () => {
    it('should archive a product by setting status to ARCHIVED', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        status: 'ARCHIVED',
      });

      const result = await service.archive('prod-1');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { status: 'ARCHIVED' },
      });
      expect(result.status).toBe('ARCHIVED');
    });
  });

  describe('variant CRUD', () => {
    const mockVariant = {
      id: 'var-1',
      productId: 'prod-1',
      name: 'Black / Large',
      sku: 'SKU-WH001-BK-L',
      price: 4999,
      stock: 20,
      attributes: { color: 'Black', size: 'Large' },
    };

    it('should create a product variant', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.productVariant.create.mockResolvedValue(mockVariant);

      const result = await service.createVariant('prod-1', {
        name: 'Black / Large',
        sku: 'SKU-WH001-BK-L',
        price: 4999,
        stock: 20,
        attributes: { color: 'Black', size: 'Large' },
      });

      expect(result).toEqual(mockVariant);
    });

    it('should update a product variant', async () => {
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      prisma.productVariant.update.mockResolvedValue({
        ...mockVariant,
        stock: 30,
      });

      const result = await service.updateVariant('var-1', { stock: 30 });

      expect(result.stock).toBe(30);
    });

    it('should delete a product variant', async () => {
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      prisma.productVariant.delete.mockResolvedValue(mockVariant);

      await service.deleteVariant('var-1');

      expect(prisma.productVariant.delete).toHaveBeenCalledWith({
        where: { id: 'var-1' },
      });
    });
  });
});
