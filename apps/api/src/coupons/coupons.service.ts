import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

// ──────────────────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────────────────

/**
 * Coupons service.
 *
 * Handles CRUD operations for discount coupons and validation
 * of coupon codes during checkout. All monetary values in BDT (৳).
 */
@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ─────────────────────────────────────────────────────────

  /**
   * Create a new coupon.
   */
  async create(dto: CreateCouponDto) {
    // Check for duplicate coupon code
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Coupon code "${dto.code}" already exists`);
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minimumOrderAmount: dto.minimumOrderAmount,
        maximumDiscount: dto.maximumDiscount,
        usageLimit: dto.usageLimit,
        usageLimitPerUser: dto.usageLimitPerUser ?? 1,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  // ─── Find All ───────────────────────────────────────────────────────

  /**
   * Get all coupons with pagination and optional filtering.
   */
  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { code: { contains: search.toUpperCase() } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ];
    } else if (status === 'expired') {
      where.endDate = { lt: new Date() };
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      data: coupons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Find One ───────────────────────────────────────────────────────

  /**
   * Get a single coupon by ID.
   */
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  // ─── Update ─────────────────────────────────────────────────────────

  /**
   * Update a coupon.
   */
  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };

    if (dto.code) {
      data.code = dto.code.toUpperCase();

      // Check for duplicate
      const existing = await this.prisma.coupon.findFirst({
        where: { code: data.code as string, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(`Coupon code "${dto.code}" already exists`);
      }
    }

    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  // ─── Delete ─────────────────────────────────────────────────────────

  /**
   * Delete a coupon.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  // ─── Validate Coupon ────────────────────────────────────────────────

  /**
   * Validate a coupon code for a given order amount.
   *
   * Checks:
   * - Coupon exists and is active
   * - Not expired
   * - Usage limit not exceeded
   * - Minimum order amount met
   *
   * Returns the calculated discount in BDT (৳).
   */
  async validateCoupon(code: string, orderAmount: number, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }

    // Check expiry
    const now = new Date();
    if (coupon.startDate > now) {
      throw new BadRequestException('This coupon is not yet active');
    }
    if (coupon.endDate && coupon.endDate < now) {
      throw new BadRequestException('This coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit) {
      const totalUsage = await this.prisma.order.count({
        where: { couponId: coupon.id },
      });
      if (totalUsage >= coupon.usageLimit) {
        throw new BadRequestException('This coupon usage limit has been reached');
      }
    }

    // Check per-user usage limit
    if (coupon.usageLimitPerUser) {
      const userUsage = await this.prisma.order.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsage >= coupon.usageLimitPerUser) {
        throw new BadRequestException(
          'You have already used this coupon the maximum number of times',
        );
      }
    }

    // Check minimum order amount (BDT ৳)
    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount.toNumber()) {
      throw new BadRequestException(
        `Minimum order amount is ৳${coupon.minimumOrderAmount} for this coupon`,
      );
    }

    // Calculate discount
    let discount: number;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * coupon.discountValue.toNumber()) / 100;
      // Apply maximum discount cap
      if (coupon.maximumDiscount) {
        discount = Math.min(discount, coupon.maximumDiscount.toNumber());
      }
    } else {
      discount = coupon.discountValue.toNumber();
    }

    // Discount cannot exceed order amount
    discount = Math.min(discount, orderAmount);

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.round((orderAmount - discount) * 100) / 100,
    };
  }
}
