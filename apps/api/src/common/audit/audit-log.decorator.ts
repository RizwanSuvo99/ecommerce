import { SetMetadata } from '@nestjs/common';

/**
 * Attach audit-log metadata to an admin mutation handler. The
 * AuditInterceptor reads this and writes an AuditLog row when the
 * handler returns without throwing.
 *
 * Example:
 *   @AuditLog({ entity: 'Banner', action: 'CREATE' })
 *   @Post('admin/banners')
 *   create(...) { ... }
 *
 * `action` defaults to the HTTP verb (POST→CREATE, PATCH/PUT→UPDATE,
 * DELETE→DELETE) so most usages can omit it.
 */
export const AUDIT_LOG_KEY = 'audit.log';

export interface AuditLogMetadata {
  /** Model name this route mutates, e.g. 'Product', 'Banner'. */
  entity: string;
  /** Action string; defaults to the HTTP-verb-derived name. */
  action?: string;
  /**
   * When true, skip capturing request body as `newValues` — useful
   * for endpoints that carry sensitive fields (passwords, tokens)
   * in the payload.
   */
  skipBody?: boolean;
}

export const AuditLog = (meta: AuditLogMetadata) => SetMetadata(AUDIT_LOG_KEY, meta);
