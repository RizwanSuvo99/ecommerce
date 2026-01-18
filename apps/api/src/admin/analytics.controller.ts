import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Admin Analytics controller.
 *
 * Provides product analytics data for the admin panel including
 * most viewed, searched, ordered, carted, and wishlisted products,
 * along with a conversion funnel.
 *
 * All endpoints require ADMIN or SUPER_ADMIN role.
 */
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get all analytics data in a single request.
   *
   * GET /admin/analytics/overview?startDate=2026-01-01&endDate=2026-02-18&limit=10
   */
  @Get('overview')
  async getOverview(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getAnalyticsOverview(
      query.startDate,
      query.endDate,
      query.limit,
    );
    return { success: true, data };
  }

  /**
   * GET /admin/analytics/most-viewed
   */
  @Get('most-viewed')
  async getMostViewed(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getMostViewedProducts(
      query.startDate,
      query.endDate,
      query.limit,
    );
    return { success: true, data };
  }

  /**
   * GET /admin/analytics/most-searched
   */
  @Get('most-searched')
  async getMostSearched(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getMostSearchedTerms(
      query.startDate,
      query.endDate,
      query.limit,
    );
    return { success: true, data };
  }

  /**
   * GET /admin/analytics/most-ordered
   */
  @Get('most-ordered')
  async getMostOrdered(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getMostOrderedProducts(
      query.startDate,
      query.endDate,
      query.limit,
    );
    return { success: true, data };
  }

  /**
   * GET /admin/analytics/most-carted
   */
  @Get('most-carted')
  async getMostCarted(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getMostCartedProducts(
      query.startDate,
      query.endDate,
      query.limit,
    );
    return { success: true, data };
  }

  /**
   * GET /admin/analytics/most-wishlisted
   */
  @Get('most-wishlisted')
  async getMostWishlisted(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getMostWishlistedProducts(
      query.startDate,
      query.endDate,
      query.limit,
    );
    return { success: true, data };
  }

  /**
   * GET /admin/analytics/funnel
   */
  @Get('funnel')
  async getConversionFunnel(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getConversionFunnel(
      query.startDate,
      query.endDate,
    );
    return { success: true, data };
  }
}
