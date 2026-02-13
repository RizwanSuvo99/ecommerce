import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';

class AuditLogQueryDto {
  userId?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /** GET /admin/audit-logs — paginated, filterable audit log viewer */
  @Get()
  async findAll(@Query() query: AuditLogQueryDto) {
    const result = await this.auditService.findAll({
      userId: query.userId,
      action: query.action,
      entity: query.entity,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 50,
    });

    return { data: result };
  }
}
