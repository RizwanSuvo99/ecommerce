import { Module } from '@nestjs/common';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AdminUsersController } from './users.controller';
import { AdminUsersService } from './users.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [DashboardController, AdminUsersController, RolesController],
  providers: [DashboardService, AdminUsersService, RolesService],
  exports: [DashboardService, AdminUsersService, RolesService],
})
export class AdminModule {}
