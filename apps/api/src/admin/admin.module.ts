import { Module } from '@nestjs/common';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdminUsersController } from './users.controller';
import { AdminUsersService } from './users.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [DashboardController, AnalyticsController, AdminUsersController, RolesController],
  providers: [DashboardService, AnalyticsService, AdminUsersService, RolesService],
  exports: [DashboardService, AnalyticsService, AdminUsersService, RolesService],
})
export class AdminModule {}
