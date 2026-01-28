import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Admin Dashboard controller.
 *
 * Provides dashboard statistics, chart data, and activity feeds
 * for the admin panel. All endpoints require ADMIN or SUPER_ADMIN role.
 *
 * All monetary values are in BDT (৳).
 */
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ─── Dashboard Stats ──────────────────────────────────────────────────────

  /**
   * Get overall dashboard statistics.
   *
   * Returns revenue, orders, customers, and products metrics with
   * growth percentages compared to the previous 30-day period.
   *
   * GET /admin/dashboard/stats
   */
  @Get('stats')
  async getStats() {
    const stats = await this.dashboardService.getStats();

    return {
      success: true,
      data: stats,
    };
  }

  // ─── Charts Data ──────────────────────────────────────────────────────────

  /**
   * Get chart data for the admin dashboard.
   *
   * Returns revenue/orders over time, top-selling products, and
   * revenue breakdown by category. All values in BDT (৳).
   *
   * GET /admin/dashboard/charts
   */
  @Get('charts')
  async getChartsData() {
    const charts = await this.dashboardService.getChartsData();

    return {
      success: true,
      data: charts,
    };
  }

  // ─── Activity Feed ────────────────────────────────────────────────────────

  /**
   * Get recent activity for the admin dashboard.
   *
   * Returns recent orders, new customer registrations, and low stock alerts.
   *
   * GET /admin/dashboard/activity
   */
  @Get('activity')
  async getActivity() {
    const activity = await this.dashboardService.getActivity();

    return {
      success: true,
      data: activity,
    };
  }
}
