import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

import { AUDIT_LOG_KEY, type AuditLogMetadata } from './audit-log.decorator';
import { AuditService } from '../../audit/audit.service';

import type { Request } from 'express';

/**
 * Writes an AuditLog row when a decorated admin handler completes
 * successfully. Reads the @AuditLog metadata and enriches it with the
 * authenticated user id, request IP, user-agent, and — unless the
 * decorator set `skipBody` — the request payload + response id.
 *
 * Never throws: audit logging is a best-effort side channel, so a DB
 * outage on the audit table must not break the actual admin mutation.
 * The underlying AuditService already catches write errors; this
 * interceptor just safely extracts the bits it needs from the request.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditLogMetadata | undefined>(AUDIT_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!meta) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request & { user?: { id?: string } }>();
    const userId = typeof req.user?.id === 'string' ? req.user.id : undefined;
    const ipAddress = extractIp(req);
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent'].slice(0, 500)
        : undefined;

    const action = meta.action ?? deriveAction(req.method);
    const newValues = meta.skipBody ? undefined : sanitize(req.body as unknown);

    return next.handle().pipe(
      tap((response) => {
        // Fire-and-forget — AuditService already swallows errors.
        void this.audit.log({
          userId: userId ?? '',
          action,
          entity: meta.entity,
          entityId: extractEntityId(req, response),
          newValues: newValues as Record<string, unknown> | undefined,
          ipAddress,
          userAgent,
        });
      }),
    );
  }
}

function deriveAction(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return method.toUpperCase();
  }
}

function extractEntityId(req: Request, response: unknown): string | undefined {
  // URL param :id wins (PATCH /admin/products/:id → that id).
  const params = req.params as Record<string, string | undefined> | undefined;
  if (params?.id) {
    return params.id;
  }
  if (params?.slug) {
    return params.slug;
  }
  if (params?.name) {
    return params.name;
  }

  // Fall back to the created entity id on POST responses.
  if (response && typeof response === 'object') {
    const r = response as Record<string, unknown>;
    const inner = (r.data ?? r) as Record<string, unknown>;
    if (typeof inner?.id === 'string') {
      return inner.id;
    }
    if (typeof inner?.slug === 'string') {
      return inner.slug;
    }
  }

  return undefined;
}

function extractIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  return req.ip ?? req.socket?.remoteAddress ?? undefined;
}

/**
 * Strip obviously sensitive fields from a body before logging. Keeps
 * the rest verbatim — admins can inspect what was posted without
 * leaking credentials / tokens.
 */
const REDACT_KEYS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
]);

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACT_KEYS.has(key) ? '[REDACTED]' : sanitize(v);
  }
  return out;
}
