import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an audit log entry. Fire-and-forget — never throws.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
          newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
        },
      });
    } catch (error) {
      // Audit logging should never break the main flow
      this.logger.error('Failed to write audit log', error);
    }
  }

  /**
   * Query audit logs with pagination and filtering.
   */
  async findAll(params: {
    userId?: string;
    action?: string;
    entity?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      action,
      entity,
      from,
      to,
      page = 1,
      limit = 50,
    } = params;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entity) where.entity = entity;
    if (from || to) {
      where.createdAt = {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      };
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
}
