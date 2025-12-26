import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalAuthGuard allows requests to proceed even without
 * a valid JWT token. If a valid token is present, the user
 * object will be attached to the request. Otherwise, the
 * request proceeds with `req.user` as `undefined`.
 *
 * Useful for endpoints that return different data for
 * authenticated vs anonymous users (e.g., product listings
 * with personalized recommendations).
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(_err: any, user: TUser): TUser {
    // Don't throw - just return null/undefined if not authenticated
    return user || (null as any);
  }
}
