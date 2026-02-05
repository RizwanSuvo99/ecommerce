import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

/**
 * Coupons controller.
 *
 * Provides CRUD operations for discount coupons (admin) and
 * coupon validation (customer). All monetary values in BDT (৳).
 */
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // ─── Admin: CRUD ──────────────────────────────────────────────────

  /**
   * Create a new coupon.
   *
   * POST /admin/coupons
   */
  @Post('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateCouponDto) {
    const coupon = await this.couponsService.create(dto);

    return {
      success: true,
      data: coupon,
    };
  }

  /**
   * Get all coupons with pagination.
   *
   * GET /admin/coupons?page=1&limit=20&search=CODE&status=active
   */
  @Get('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.couponsService.findAll({
      page,
      limit,
      search,
      status,
    });

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get a single coupon by ID.
   *
   * GET /admin/coupons/:id
   */
  @Get('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findOne(@Param('id') id: string) {
    const coupon = await this.couponsService.findOne(id);

    return {
      success: true,
      data: coupon,
    };
  }

  /**
   * Update a coupon.
   *
   * PATCH /admin/coupons/:id
   */
  @Patch('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const coupon = await this.couponsService.update(id, dto);

    return {
      success: true,
      data: coupon,
    };
  }

  /**
   * Delete a coupon.
   *
   * DELETE /admin/coupons/:id
   */
  @Delete('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async remove(@Param('id') id: string) {
    await this.couponsService.remove(id);

    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  // ─── Customer: Validate Coupon ────────────────────────────────────

  /**
   * Validate a coupon code for the given order amount.
   *
   * POST /coupons/validate
   */
  @Post('coupons/validate')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(
    @Body() body: { code: string; orderAmount: number },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.couponsService.validateCoupon(
      body.code,
      body.orderAmount,
      user.id,
    );

    return {
      success: true,
      data: result,
    };
  }
}
