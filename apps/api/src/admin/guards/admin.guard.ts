import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied - authentication required');
    }

    const adminRoles: string[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

    if (!adminRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied - admin privileges required');
    }

    return true;
  }
}
